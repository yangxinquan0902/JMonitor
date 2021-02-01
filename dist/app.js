const shell = require('shelljs');
const chalk = require('chalk');


// 1. 获取镜像源
const getRegistry = ()=>{
    // async: 是否异步执行, 默认false，传入callback时自动开启
    shell.exec('npm config get registry', { async: false });
    setRegistry('https://registry.npmjs.org', login);
};


// 2. 设置镜像源
const setRegistry = (reg, cb)=>{
    shell.exec(`npm config set registry ${reg}`, { async: false });
    cb && cb();
};


// 3. 登录
const login = () => {
    var username = 'james.yang';
    var password = 'yang19920817';
    var email = '1501684012@qq.com';
    // 必须加上换行， 否则不会执行下一行命令
    var inputArray = [
        username + "\n",
        password + "\n",
        email + "\n"
    ];

    console.log(chalk.green("npm login"));

    var child = shell.exec('npm login', { async: true })

    child.stdout.on('data', () => {
        var cmd = inputArray.shift();
        if (cmd) {

            // 不输出， 安全起见
            shell.echo("input " + cmd);
            child.stdin.write(cmd);

        } else {
            publish(child);
        }
    });
};

// 4. 发布
const publish = (child)=>{
    console.log(chalk.green("npm publish"));
    shell.exec('npm publish', { async: false });
    console.log(chalk.green("发布完成"));
    child.stdin.end();
};


getRegistry();
