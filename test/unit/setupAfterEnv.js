// テスト中の console.error / console.warn をテスト失敗として扱う。
// 意図した出力は各テストで jest.spyOn(console, ...) を使って受け止め、内容を検証する。
import failOnConsole from 'jest-fail-on-console'

failOnConsole()
