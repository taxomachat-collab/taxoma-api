const ARES_BASE_URL = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";

function isValidIcoFormat(ico) {
  return /^\d{8}$/.test(ico);
}

function isValidIcoChecksum(ico) {
  if (!/^\d{8}$/.test(ico)) return false;

  const digits = ico.split("").map(Number);
  const weights = [8, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, weight, i) => acc + digits[i] * weight, 0);
  const mod = sum % 11;

  let checkDigit;
  if (mod === 0) checkDigit = 1;
  else if (mod === 1) checkDigit = 0;
  else checkDigit = 11 - mod;

  return digits[7] === checkDigit;
}

function cleanZip(value) {
  if (!value) return "";
  return String(value).replace(/\s+/g, "");
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return "";
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

function pick(obj, paths) {
  for (const path of paths) {
    const value = getByPath(obj, path);
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return "";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function detectSubjectType(data) {
  const legalForm = firstNonEmpty(
    pick(data, [
      "pravniFormaNazev",
      "pravniForma.text",
      "pravniForma",
      "ekonomickySubjekt.pravniFormaNazev",
      "ekonomickySubjekt.pravniForma.text"
    ])
  );

  const name = firstNonEmpty(
    pick(data, [
      "obchodniJmeno",
      "nazev",
      "jmeno",
      "firma",
      "ekonomickySubjekt.obchodniJmeno"
    ])
  );

  const legalFormText = normalizeText(legalForm);
  const nameText = normalizeText(name);

  // Hrubá, ale praktická detekce právnických osob.
  const companyMarkers = [
    "spolecnost s rucenim omezenym",
    "s.r.o",
    "a.s",
    "akciova spolecnost",
    "druzstvo",
    "z.s",
    "zapsany spolek",
    "ustav",
    "nadace",
    "obec",
    "mesto",
    "prispevkova organizace",
    "v.o.s",
    "k.s"
  ];

  const looksLikeCompany =
    companyMarkers.some((marker) => legalFormText.includes(marker)) ||
    companyMarkers.some((marker) => nameText.includes(marker));

  if (looksLikeCompany) {
    return {
      subject_type: "company",
      is_supported_for_this_service: false,
      unsupported_reason: "legal_entity_not_supported"
    };
  }

  // Když to nevypadá jako firma, bereme to zatím jako podnikající fyzickou osobu.
  return {
    subject_type: "person",
    is_supported_for_this_service: true,
    unsupported_reason: ""
  };
}

function normalizeAresResponse(data, ico) {
  const typeInfo = detectSubjectType(data);

  const subject = {
    ico,
    dic: firstNonEmpty(
      pick(data, ["dic", "danoveIdentifikacniCislo"])
    ),
    name: firstNonEmpty(
      pick(data, [
        "obchodniJmeno",
        "nazev",
        "jmeno",
        "firma",
        "ekonomickySubjekt.obchodniJmeno"
      ])
    ),
    legal_form: firstNonEmpty(
      pick(data, [
        "pravniFormaNazev",
        "pravniForma.text",
        "pravniForma",
        "ekonomickySubjekt.pravniFormaNazev",
        "ekonomickySubjekt.pravniForma"
      ])
    ),
    street: firstNonEmpty(
      pick(data, [
        "sidlo.nazevUlice",
        "sidlo.ulice",
        "adresa.nazevUlice",
        "adresa.ulice",
        "sidlo.textovaAdresa"
      ])
    ),
    descriptive_number: firstNonEmpty(
      pick(data, [
        "sidlo.cisloDomovni",
        "adresa.cisloDomovni",
        "sidlo.cisloPopisne",
        "adresa.cisloPopisne"
      ])
    ),
    orientation_number: firstNonEmpty(
      pick(data, [
        "sidlo.cisloOrientacni",
        "adresa.cisloOrientacni"
      ])
    ),
    city: firstNonEmpty(
      pick(data, [
        "sidlo.nazevObce",
        "adresa.nazevObce",
        "sidlo.obec",
        "adresa.obec"
      ])
    ),
    zip: cleanZip(
      firstNonEmpty(
        pick(data, [
          "sidlo.psc",
          "adresa.psc"
        ])
      )
    ),
    country_code: firstNonEmpty(
      pick(data, [
        "sidlo.kodStatu",
        "adresa.kodStatu",
        "sidlo.stat.kod",
        "adresa.stat.kod"
      ]),
      "CZ"
    ),
    country_name: firstNonEmpty(
      pick(data, [
        "sidlo.nazevStatu",
        "adresa.nazevStatu",
        "sidlo.stat.nazev",
        "adresa.stat.nazev"
      ]),
      "Česká republika"
    ),
    data_box: firstNonEmpty(
      pick(data, [
        "datovaSchranka",
        "datovaSchrankaId",
        "idDatoveSchranky"
      ])
    ),
    nace_code: firstNonEmpty(
      pick(data, [
        "primarniCinnost.kod",
        "hlavniEkonomickaCinnost.kod",
        "czNace.kod",
        "cinnosti.0.kod"
      ])
    ),
    nace_name: firstNonEmpty(
      pick(data, [
        "primarniCinnost.nazev",
        "hlavniEkonomickaCinnost.nazev",
        "czNace.nazev",
        "cinnosti.0.nazev"
      ])
    ),
    subject_type: typeInfo.subject_type,
    is_supported_for_this_service: typeInfo.is_supported_for_this_service,
    unsupported_reason: typeInfo.unsupported_reason
  };

  return subject;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "method_not_allowed"
    });
  }

  const rawIco = req.query.ico || "";
  const ico = String(rawIco).replace(/\D/g, "");

  if (!isValidIcoFormat(ico)) {
    return res.status(400).json({
      success: false,
      error: "invalid_ico_format"
    });
  }

  if (!isValidIcoChecksum(ico)) {
    return res.status(400).json({
      success: false,
      error: "invalid_ico_checksum"
    });
  }

  try {
    const response = await fetch(`${ARES_BASE_URL}/ekonomicke-subjekty/${ico}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (response.status === 404) {
      return res.status(404).json({
        success: false,
        error: "subject_not_found"
      });
    }

    if (!response.ok) {
      const text = await response.text();

      return res.status(502).json({
        success: false,
        error: "ares_upstream_error",
        upstream_status: response.status,
        upstream_body: text.slice(0, 500)
      });
    }

    const data = await response.json();
    const subject = normalizeAresResponse(data, ico);

    return res.status(200).json({
      success: true,
      subject
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "internal_error",
      message: error.message
    });
  }
};
