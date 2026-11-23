/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PixConfig } from '../types';

export function padVal(val: string | number, length = 2): string {
  return String(val).padStart(length, '0');
}

export function formatTag(id: string, value: string): string {
  return `${id}${padVal(value.length)}${value}`;
}

export function sanitizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ""); // leave standard alphanumeric & spaces only
}

export function generatePixPayload(config: PixConfig): string {
  const gui = formatTag('00', 'br.gov.bcb.pix');
  
  // Format / clean key depending on type
  let keyVal = config.key.trim();
  if (config.keyType === 'phone') {
    // Digital clean
    let digits = keyVal.replace(/\D/g, '');
    // Insert brazilian country code prefix if missing and fits a brazilian phone size
    if (digits.length > 0 && !digits.startsWith('55') && digits.length <= 11) {
      digits = '55' + digits;
    }
    // Spec for Pix requires "+55..." format for phone numbers
    keyVal = '+' + digits;
  } else if (config.keyType === 'cpf_cnpj') {
    keyVal = keyVal.replace(/\D/g, '');
  }
  
  const keyTag = formatTag('01', keyVal);
  
  // Optional info adicional message
  const descText = config.description ? config.description.trim() : '';
  const descTag = descText ? formatTag('02', sanitizeText(descText).substring(0, 72)) : '';
  
  const merchantInfoValue = `${gui}${keyTag}${descTag}`;
  const merchantInfoTag = formatTag('26', merchantInfoValue);
  
  // Merchant Category Code
  const mccTag = formatTag('52', '0000');
  
  // Currency (BRL)
  const currencyTag = formatTag('53', '986');
  
  // Value (BRL decimal text), e.g. 540510.00
  let amountTag = '';
  if (config.amount) {
    const num = parseFloat(config.amount);
    if (!isNaN(num) && num > 0) {
      amountTag = formatTag('54', num.toFixed(2));
    }
  }
  
  // Country Code
  const countryTag = formatTag('58', 'BR');
  
  // Receiver name (normalize) Max 25 chars
  const rawName = config.receiverName.trim() || 'PIX RECEIVER';
  const nameTag = formatTag('59', sanitizeText(rawName).substring(0, 25));
  
  // Receiver city (normalize) Max 15 chars
  const rawCity = config.receiverCity.trim() || 'SAO PAULO';
  const cityTag = formatTag('60', sanitizeText(rawCity).substring(0, 15));
  
  // TXID (transaction identifier) format
  let rawTxid = config.txid ? config.txid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  if (!rawTxid) {
    rawTxid = '***';
  } else {
    rawTxid = rawTxid.substring(0, 25);
  }
  const txidTag = formatTag('05', rawTxid);
  const additionalDataTag = formatTag('62', txidTag);
  
  // Compile segments
  const rawPayload = [
    formatTag('00', '01'), // Format ID
    formatTag('01', '11'), // Method static
    merchantInfoTag,
    mccTag,
    currencyTag,
    amountTag,
    countryTag,
    nameTag,
    cityTag,
    additionalDataTag,
    '6304' // Ready for CRC
  ].join('');
  
  const crc = computeCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}

export function computeCRC16(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  for (let i = 0; i < str.length; i++) {
    const b = str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = ((b >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
