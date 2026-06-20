const HEADER_PATTERN =
  /^(feat|fix|chore|docs|style|refactor|test|ci|build|perf|revert): [a-z0-9].*$/

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'header-format': ({ header }) => {
          const valid = HEADER_PATTERN.test(header)
          return [
            valid,
            'header must match "<type>: <subject>" with a single space after the colon',
          ]
        },
        'no-consecutive-spaces': ({ header }) => {
          const hasDoubleSpace = / {2,}/.test(header)
          return [
            !hasDoubleSpace,
            'commit header must not contain consecutive spaces',
          ]
        },
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'style',
        'refactor',
        'test',
        'ci',
        'build',
        'perf',
        'revert',
      ],
    ],
    'header-format': [2, 'always'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'no-consecutive-spaces': [2, 'always'],
  },
}
