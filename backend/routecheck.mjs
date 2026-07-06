import app from './src/app.ts';
const routes = app.default._router.stack.filter(r=>r.route).map(r=>({path:r.route.path, methods:Object.keys(r.route.methods)}));
console.log(JSON.stringify(routes,null,2));
