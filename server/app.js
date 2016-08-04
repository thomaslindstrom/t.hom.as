// ---------------------------------------------------------------------------
//  app.js
// ---------------------------------------------------------------------------

    import koa from 'koa';
    import serve from 'koa-static';
    import mount from 'koa-mount';

    const app = koa();
    const webpackConfiguration = require('webpack.config.js');

    const publicPath = '/';

    // -------------------------------------
    //  Development tools
    // -------------------------------------
        if (process.env.NODE_ENV === 'development') {
            const compiler = require('webpack')(webpackConfiguration);

            app.use(require('koa-webpack-dev-middleware')(compiler, {
                publicPath: publicPath,
                stats: webpackConfiguration.stats
            }));

            const hotMiddleware = require('webpack-hot-middleware')(compiler, {
                publicPath: publicPath,
                heartbeat: 10 * 1000
            });

            app.use(function* (next) {
                yield hotMiddleware.bind(null, this.req, this.res);
                yield next;
            });
        }

    // -------------------------------------
    //  Listeners
    // -------------------------------------
        app.use(mount(publicPath, serve(`./static`, {
            maxage: 2419200000
        })));

    export default app;
