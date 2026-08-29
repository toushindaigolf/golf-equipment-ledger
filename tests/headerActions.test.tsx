import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HeaderActions } from '../src/components/HeaderActions';

describe('HeaderActions', () => {
  it('keeps the primary action and desktop data operations available', () => {
    const html = renderToStaticMarkup(<HeaderActions
      addDisabled={false}
      csvLocked
      onAdd={() => undefined}
      onBackup={() => undefined}
      onCsv={() => undefined}
      onRestore={() => undefined}
    />);

    expect(html).toContain('＋ 新規登録');
    expect(html).toContain('バックアップ');
    expect(html).toContain('復元');
    expect(html).toContain('CSV出力');
    expect(html).toContain('aria-label="データ操作メニュー"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('accept="application/json"');
  });
});
