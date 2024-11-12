import 'jest-preset-angular/setup-jest';
import failOnConsole from 'jest-fail-on-console';
import 'web-streams-polyfill/polyfill';

failOnConsole({
  shouldFailOnWarn: false,
});
