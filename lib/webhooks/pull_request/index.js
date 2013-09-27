#!/usr/bin/env node

process.stdout.write("Content-type: text/html\n\n");

var fs=require('fs');
var shell = require('shelljs');
var grunt = require('grunt');

var data = JSON.parse(fs.readFileSync('/dev/stdin').toString());
var event = process.env.HTTP_X_GITHUB_EVENT;

if(event != 'pull_request') process.exit(0);

var action = data.action;
var pullRequest = data.pull_request;
var patchURL = pullRequest.patch_url;
var rootDir = fs.realpathSync(__dirname + '/../../..');

if(action == 'closed'){
    var cmd = deletePatch(data.number);
    addTask(cmd, action);
} else {
    var cmd = createPatch(data.number, patchURL);    
    addTask(cmd, action);
}

function deletePatch(id){
    var patchDir = getPatchDir(id);
    var cmd = "rm -fR " + patchDir;
    return cmd;
}
function createPatch(id, patchURL){
    var patchDir = getPatchDir(id); 
    //var repo = shell.exec('(cd ' + rootDir + '; git config --get remote.origin.url)', {silent: true}).output.replace('\n', '');      
    var cmd = "if [ -d " + patchDir + " ]; then\n rm -fR " + patchDir + " \nfi\n";
    cmd += "mkdir " + patchDir + " && cp -R " + rootDir + "/. " + patchDir + " && cd " + patchDir;
    cmd += " && curl " + patchURL + " | git am";
    cmd += " && npm install && grunt";
    return cmd; 
}
function getPatchDir(id){
    return fs.realpathSync(rootDir + '/../patch') + '/' + id;
}
function addTask(cmd, action){
    var taskDir = rootDir + '/tasks';
    var taskFile = taskDir + '/' + new Date().getTime();
    cmd = "#!/usr/bin/env bash\n\n # Action \"" + action + "\"\n" + cmd;  
    grunt.file.write(taskFile, cmd);
    fs.chmodSync(taskFile, 0777);
}




