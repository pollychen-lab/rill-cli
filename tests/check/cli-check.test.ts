/**
 * Tests for parseCheckArgs function
 *
 * Test Coverage Matrix (maps TCs to specification requirements):
 * --help flag returns help mode
 * Unknown flag throws error
 * Missing file throws error
 * --fix flag parsed correctly
 * --verbose flag parsed correctly
 * --format text parsed correctly
 * --format json parsed correctly
 * --format with invalid value throws error
 */

import { describe, it, expect } from 'vitest';
import { parseCheckArgs } from '../../src/cli-check.js';

describe('parseCheckArgs', () => {
  describe('help mode', () => {
    it('returns help mode when --help flag present', () => {
      const result = parseCheckArgs(['--help']);
      expect(result).toEqual({ mode: 'help' });
    });

    it('returns help mode when -h flag present', () => {
      const result = parseCheckArgs(['-h']);
      expect(result).toEqual({ mode: 'help' });
    });

    it('returns help mode when --help flag present with other args', () => {
      const result = parseCheckArgs(['file.rill', '--help', '--fix']);
      expect(result).toEqual({ mode: 'help' });
    });
  });

  describe('error cases', () => {
    it('throws error for unknown flag', () => {
      expect(() => parseCheckArgs(['--unknown', 'file.rill'])).toThrow(
        'Unknown option: --unknown'
      );
    });

    it('throws error for unknown short flag', () => {
      expect(() => parseCheckArgs(['-x', 'file.rill'])).toThrow(
        'Unknown option: -x'
      );
    });

    it('throws when --fix supplied without a file argument', () => {
      expect(() => parseCheckArgs(['--fix'])).toThrow(
        '--fix requires a file argument'
      );
    });

    it('throws when --fix combined with other flags but no file', () => {
      expect(() => parseCheckArgs(['--fix', '--verbose'])).toThrow(
        '--fix requires a file argument'
      );
    });

    it('returns scan mode when no file and no --fix [FRICTION-NOTES 2026-05-03]', () => {
      const result = parseCheckArgs([]);
      expect(result).toEqual({
        mode: 'scan',
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('throws when --types combined with --fix', () => {
      expect(() => parseCheckArgs(['--types', '--fix'])).toThrow(
        '--types cannot be combined with --fix'
      );
    });

    it('throws error when --format has no value', () => {
      expect(() => parseCheckArgs(['file.rill', '--format'])).toThrow(
        '--format requires argument: text or json'
      );
    });

    it('throws error when --format value is another flag', () => {
      expect(() => parseCheckArgs(['file.rill', '--format', '--fix'])).toThrow(
        '--format requires argument: text or json'
      );
    });

    it('throws error when --format value is invalid', () => {
      expect(() => parseCheckArgs(['file.rill', '--format', 'xml'])).toThrow(
        'Invalid format: xml. Expected text or json'
      );
    });
  });

  describe('check mode parsing', () => {
    it('parses file path correctly', () => {
      const result = parseCheckArgs(['test.rill']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: false,
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('parses --fix flag correctly', () => {
      const result = parseCheckArgs(['test.rill', '--fix']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: true,
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('parses --verbose flag correctly', () => {
      const result = parseCheckArgs(['test.rill', '--verbose']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: false,
        verbose: true,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('parses --format text correctly', () => {
      const result = parseCheckArgs(['test.rill', '--format', 'text']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: false,
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('parses --format json correctly', () => {
      const result = parseCheckArgs(['test.rill', '--format', 'json']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: false,
        verbose: false,
        format: 'json',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('parses multiple flags together [TC-5, TC-6, TC-7]', () => {
      const result = parseCheckArgs([
        'test.rill',
        '--fix',
        '--verbose',
        '--format',
        'json',
      ]);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: true,
        verbose: true,
        format: 'json',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('extracts file path when mixed with flags', () => {
      const result = parseCheckArgs(['--fix', 'test.rill', '--verbose']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: true,
        verbose: true,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('uses default format when not specified', () => {
      const result = parseCheckArgs(['test.rill']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: false,
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: false,
      });
    });

    it('parses --types alongside a file argument [FRICTION-NOTES 2026-05-03]', () => {
      const result = parseCheckArgs(['test.rill', '--types']);
      expect(result).toEqual({
        mode: 'check',
        file: 'test.rill',
        fix: false,
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: true,
      });
    });

    it('parses bare --types as a scan with runTypes=true', () => {
      const result = parseCheckArgs(['--types']);
      expect(result).toEqual({
        mode: 'scan',
        verbose: false,
        format: 'text',
        minSeverity: 'error',
        runTypes: true,
      });
    });
  });
});
