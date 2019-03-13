# `m-lazy-load-img` 用于懒加载图片
> 兼容使用 `IntersectionObserver`、`touchend` 与 `scroll` 做的懒加载，其中 `touchend` 事件在 ‘ios’ 弹性滚动中做了相关优化

### install

#### NPM

```
npm i m-lazy-load-img -S
```

#### Yarn

```
yarn add m-lazy-load-img
```

### Usage

```html
<t-lazy-load src="https://ss2.bdstatic.com/kfoZeXSm1A5BphGlnYG/skin/1.jpg" tag="div" class="img-wrap img1">
  <img src="https://ss2.bdstatic.com/kfoZeXSm1A5BphGlnYG/skin/1.jpg">
  <template slot="placeholder">
    <loading v-model="showLoading" :auto-hide="autoHide">正在加载...</loading>
  </template>
</t-lazy-load>
```

### Props
| Props | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| tag | String | `div` | HTML tag or component tag as the wrapper eg: div/t-card |
| src | String |  | The img src |
| ratio | Number | `0.3` | visibility ratio |
| transitionName | String | `zoom` | visible transition, there two choices, eg: `fade`、`zoom` |
