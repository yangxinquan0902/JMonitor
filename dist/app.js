const shell = require('shelljs');
const chalk = require('chalk');


// 异步命令
const exec = (commd, cb)=>{
    shell.exec(commd, { async: false }, ()=>{
        cb && cb();
    });
};

// 2. 登录
function npmlogin() {
    var username = 'james.yang';
    var password = 'yang19920817';
    var email = '1501684012@qq.com';
    var inputArray = [
        username + "\n",
        password + "\n",
        email + "\n",
    ];

    console.log(chalk.green("npm login"));

    var child = shell.exec('npm login', { async: true })

    child.stdout.on('data', () => {
        var cmd = inputArray.shift();
        if (cmd) {

            shell.echo("input " + cmd);
            child.stdin.write(cmd);

        } else {
            
            // 3. 发布
            console.log(chalk.green("npm publish"));
            exec('npm publish', ()=>{
                // 4. 设置回原来镜像源
                exec('npm config set registry=https://registry.npm.taobao.org', ()=>{
                    console.log(chalk.green("发布完成"));
                    child.stdin.end();
                });
            });

        }
    });
};

// 1. 设置镜像源
exec('npm config set registry=http://registry.npmjs.org', npmlogin);


