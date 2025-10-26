declare module '*.tsx' {
  const component: any;
  export default component;
}

declare module '*.ts' {
  const component: any;
  export default component;
}
// Intentionally empty: relying on @types/react instead
export {};
