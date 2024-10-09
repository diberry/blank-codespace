"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
var _d;
Object.defineProperty(exports, "__esModule", { value: true });
var openai_1 = require("openai");
// Get environment variables
var azureOpenAIKey = process.env.AZURE_OPENAI_KEY;
var azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
var azureOpenAIDeployment = process.env
    .AZURE_OPENAI_DEPLOYMENT_NAME;
var openAIVersion = process.env.OPENAI_API_VERSION;
// Check env variables
if (!azureOpenAIKey || !azureOpenAIEndpoint || !azureOpenAIDeployment || !openAIVersion) {
    throw new Error("Please set AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT_NAME in your environment variables.");
}
// Get Azure SDK client
var getClient = function () {
    var assistantsClient = new openai_1.AzureOpenAI({
        endpoint: azureOpenAIEndpoint,
        apiVersion: openAIVersion,
        apiKey: azureOpenAIKey,
    });
    return assistantsClient;
};
var assistantsClient = getClient();
var options = {
    model: azureOpenAIDeployment, // Deployment name seen in Azure AI Studio
    name: "Math Tutor",
    instructions: "You are a personal math tutor. Write and run JavaScript code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
};
var role = "user";
var message = "I need to solve the equation `3x + 11 = 14`. Can you help me?";
// Create an assistant
var assistantResponse = await assistantsClient.beta.assistants.create(options);
console.log("Assistant created: ".concat(JSON.stringify(assistantResponse)));
// Create a thread
var assistantThread = await assistantsClient.beta.threads.create({});
console.log("Thread created: ".concat(JSON.stringify(assistantThread)));
// Add a user question to the thread
var threadResponse = await assistantsClient.beta.threads.messages.create(assistantThread.id, {
    role: role,
    content: message,
});
console.log("Message created:  ".concat(JSON.stringify(threadResponse)));
// Run the thread and poll it until it is in a terminal state
var runResponse = await assistantsClient.beta.threads.runs.createAndPoll(assistantThread.id, {
    assistant_id: assistantResponse.id,
}, { pollIntervalMs: 500 });
console.log("Run created:  ".concat(JSON.stringify(runResponse)));
// Get the messages
var runMessages = await assistantsClient.beta.threads.messages.list(assistantThread.id);
try {
    for (var _e = true, runMessages_1 = __asyncValues(runMessages), runMessages_1_1; runMessages_1_1 = await runMessages_1.next(), _a = runMessages_1_1.done, !_a; _e = true) {
        _c = runMessages_1_1.value;
        _e = false;
        var runMessageDatum = _c;
        for (var _i = 0, _f = runMessageDatum.content; _i < _f.length; _i++) {
            var item = _f[_i];
            // types are: "image_file" or "text"
            if (item.type === "text") {
                console.log("Message content: ".concat(JSON.stringify((_d = item.text) === null || _d === void 0 ? void 0 : _d.value)));
            }
        }
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (!_e && !_a && (_b = runMessages_1.return)) await _b.call(runMessages_1);
    }
    finally { if (e_1) throw e_1.error; }
}
