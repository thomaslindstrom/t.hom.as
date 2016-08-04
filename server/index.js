// ---------------------------------------------------------------------------
//  server: index.js
// ---------------------------------------------------------------------------

    import http from 'http';
    import chalk from 'chalk';

    import app from 'server/app';

    console.log(
        chalk.bgGreen(' '),
        chalk.bgGreen.black(`Starting ${app.name}...`),
        chalk.bgYellow(' '),
        chalk.bgRed(' '),
        chalk.bgBlue(' '),
        chalk.bgMagenta(' '),
        chalk.bgCyan(' ')
    );

    console.log(
        chalk.bgCyan(' '),
        chalk.cyan('Firing up unsecure HTTP server...')
    );

    const port = 5000;
    const server = http.createServer(app.callback());

    const listener = server.listen(port, function () {
        console.log(
            chalk.green('Listening'),
            chalk.grey('at port'),
            chalk.yellow(listener.address().port)
        );
    });
