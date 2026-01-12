export function generatePixCode(
  pixKey: string,
  amount: number,
  merchantName: string = "ESPACO SETE STORE",
  city: string = "SAO PAULO"
): string {
  const formatEMV = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };

  const gui = formatEMV("00", "br.gov.bcb.pix");
  const key = formatEMV("01", pixKey);
  const merchantAccount = formatEMV("26", gui + key);

  const payloadFormat = formatEMV("00", "01");
  const merchantCategory = formatEMV("52", "0000");
  const transactionCurrency = formatEMV("53", "986");
  const transactionAmount = formatEMV("54", amount.toFixed(2));
  const countryCode = formatEMV("58", "BR");
  const merchantNameField = formatEMV("59", merchantName.substring(0, 25));
  const cityField = formatEMV("60", city.substring(0, 15));
  const additionalData = formatEMV("62", formatEMV("05", "***"));

  let payload =
    payloadFormat +
    merchantAccount +
    merchantCategory +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantNameField +
    cityField +
    additionalData +
    "6304";

  const crc = crc16ccitt(payload);
  return payload + crc.toString(16).toUpperCase().padStart(4, "0");
}

function crc16ccitt(str: string): number {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xffff;
  }
  return crc;
}
