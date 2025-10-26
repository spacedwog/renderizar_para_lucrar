// Disable strict checking for React Native components
declare module '*.tsx' {
  const component: any;
  export default component;
}

declare module '*.ts' {
  const component: any;
  export default component;
}