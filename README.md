# eslint-plugin-peace

some rules in bytedance devops group

## Installation

Install `eslint-plugin-peace`:

```
$ yarn add -D eslint-plugin-peace
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-peace` globally.

## Usage

Add `devops` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["eslint-plugin-peace"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@byted/devops/beautiful-space": 2
  }
}
```

## Supported Rules

### beautiful-space

用来在中英文之间插入空格。比如 `iOS和Android是两个操作系统` 会自动修复成 `iOS 和 Android 是两个操作系统`

- [x] 在中文和英文字母，中文和数字之间插入空格
- [ ] 支持英文字母和中文之间插入空格
- [ ] 支持检测模板字符串
- [ ] 标点符号和文字之间插入空格

NOTE：因为 ESLint 修复模板字符串的逻辑有点问题，会丢失关键引号。这意味着要做到修复必须自己重新解析一边模板字符串才行。但是目模板字符串本身的规则又过于复杂，所以这次并没有加进来
