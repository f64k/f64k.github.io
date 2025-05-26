
class MyOpenRouter {
    constructor() {
        //super('openrouter');
        this.ApiKey = localStorage.getItem('k_openrouter');
        this.arrAllMessages = [];

        this.dictOpenRouterApiUrls = {
            "getAuthKey": "https://openrouter.ai/api/v1/auth/key",
            "getModels": "https://openrouter.ai/api/v1/models",
            "postChatCompletions": "https://openrouter.ai/api/v1/chat/completions",
        }

        this.arrModels = [
            { name: "mistralai/mixtral-8x7b-instruct:free", label: "такой нет, или ошибка или и не было", dateOfLastAnswer: "" },
            { name: "mistralai/devstral-small:free", label: "mistralai/devstral-small:free", dateOfLastAnswer: "" },
            { name: "tngtech/deepseek-r1t-chimera:free", label: "tngtech/deepseek-r1t-chimera:free" },
            { name: "deepseek/deepseek-r1:free", label: "deepseek/deepseek-r1:free" },
        ];
        this.MODEL_NUM = 3;
        // thisarrModels[MODEL_NUM].name
        this.selectedModelName = this.arrModels[this.MODEL_NUM].name;
    }


    async AskSelectedModelAsync(strQuestion) {
        if (!strQuestion || strQuestion.trim() === "") {
            strQuestion = "совет дня";
        }
        if (strQuestion.startsWith("sk-or-v1-")) {
            this.ApiKey = strQuestion;
            strQuestion = "совет дня. как хранить api ключ?";
        }
        if (!this.ApiKey) { throw new Error("API_KEY не задан"); }
        this.arrAllMessages.push({ role: "user", content: strQuestion });
        const arrLastUserMessage = this.arrAllMessages.slice(-1);
        const objBody = { model: this.selectedModelName, messages: arrLastUserMessage };
        const objQueryPost = {
            method: "POST",
            headers: { Authorization: `Bearer ${this.ApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify(objBody)
        };
        // Запрос к OpenRouter
        const response = await fetch(this.dictOpenRouterApiUrls.postChatCompletions, objQueryPost);
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            this.saveApiKey();
            this.arrAllMessages.push({ role: "assistant", content: data.choices[0].message.content });
            return this.arrAllMessages[this.arrAllMessages.length - 1].content;
        } else {
            if (data.error) { throw data.error; }
            throw data;
            // Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day user_2xRJbZGkaQF4thZ1yODkLOm3PSn
        }
        return responseMessage;
    }

    saveApiKey() {
        // Сохраняем ключ
        if (localStorage.getItem("k_openrouter") !== this.ApiKey) {
            debugger;
            localStorage.setItem("k_openrouter", this.ApiKey);
        }
    }

    /*            if (API_KEY) {
                    try {
                        const objQueryGet = { method: 'GET', headers: { Authorization: `Bearer ${API_KEY}` } };
                        const response2 = await fetch(dictOpenRouterApiUrls.getAuthKey, objQueryGet);
                        const data2 = await response2.json();
                        console.log(data2);

                        const response3 = await fetch(dictOpenRouterApiUrls.getModels, objQueryGet);
                        const data3 = await response3.json();
                        console.log(data3);
                        debugger;
                    } catch (error) {
                        responseMessage = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
                    }
                }
                else {
                    responseMessage = "# API_KEY не задан";
                }
     */

}