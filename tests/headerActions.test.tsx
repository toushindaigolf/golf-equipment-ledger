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
      onContact={() => undefined}
      onCsv={() => undefined}
      onRestore={() => undefined}
    />);

    expect(html).toContain('＋ 新規登録');
    expect(html).toContain('データを保存');
    expect(html).toContain('保存データを読み込む');
    expect(html).toContain('CSV出力');
    expect(html).toContain('aria-label="データ操作メニュー"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('accept="application/json"');
  });
});
