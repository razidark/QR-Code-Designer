/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { padVal, formatTag, sanitizeText, generatePixPayload, computeCRC16 } from './pix';

describe('PIX Payload Generator', () => {
  it('padVal should pad numbers and strings with leading zeros', () => {
    expect(padVal(5, 2)).toBe('05');
    expect(padVal(12, 2)).toBe('12');
    expect(padVal(1, 4)).toBe('0001');
  });

  it('formatTag should output ID + 2-digit length + value', () => {
    expect(formatTag('00', '01')).toBe('000201');
    expect(formatTag('59', 'RAZOR RZL')).toBe('5909RAZOR RZL');
  });

  it('sanitizeText should remove accents, convert to uppercase, and strip special chars', () => {
    expect(sanitizeText('São Paulo')).toBe('SAO PAULO');
    expect(sanitizeText('Ação & Reação')).toBe('ACAO  REACAO');
  });

  it('computeCRC16 should compute valid CRC16-CCITT hex strings', () => {
    const raw = '00020126360014BR.GOV.BCB.PIX0114+55119999999995200005303986540510.005802BR5909RAZOR RZL6009SAO PAULO62070503***6304';
    const crc = computeCRC16(raw);
    expect(crc).toHaveLength(4);
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
  });

  it('generatePixPayload should build a valid PIX EMV code', () => {
    const payload = generatePixPayload({
      key: '11999999999',
      keyType: 'phone',
      amount: '150.50',
      receiverName: 'Razor RZL',
      receiverCity: 'Sao Paulo',
      description: 'Payment Test'
    });

    expect(payload).toContain('br.gov.bcb.pix');
    expect(payload).toContain('150.50');
    expect(payload).toContain('SAO PAULO');
    expect(payload).toContain('RAZOR RZL');
  });
});
