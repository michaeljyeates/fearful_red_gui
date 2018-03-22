<template>
    <div class="poll-form">
        <h1>
            {{ question }}
        </h1>
        
        <div v-if="myAddress">
            <p>Voting using address {{ myAddress }}</p>
            
            <ul id="poll-answers">
                <li v-for="(answer, index) in answers">
                    <label v-bind:data-index="index"><input type="radio" name="resp" v-bind:value="index" class="answer-radio" /> {{ answer }}</label>
                </li>
            </ul>

            <button type="button" class="btn vote-btn" @click="doVote">
                Vote
            </button>
            
            <ul class="instructions-list">
                <li>Choose your response and then click vote.</li>
                <li>MetaMask will show a dialog asking you to sign a message which confirms your vote.</li>
                <li>You WILL NOT have to pay GAS.</li>
            </ul>
        </div>
        <div v-else="">
            <p>You do not appear to have MetaMask installed, or it is logged out.</p>
            <p>If you want to use it then please log in and choose your account on Main Net</p>
            <h3>Instructions for voting with MyEtherWallet</h3>
            <p>First choose your response below</p>
            <ul id="poll-answers-msg">
                <li v-for="(answer, index) in answers">
                    <label v-bind:data-index="index"><input type="radio" name="resp" v-bind:value="index" class="answer-radio" @change="genMsg" /> {{ answer }}</label>
                </li>
            </ul>

            
            <p>You can also vote using MyEtherWallet.  Visit the <a href="https://www.myetherwallet.com/signmsg.html" target="_blank">Signing Tool</a>, enter the following text in the message box</p>
            
            <p><input type="text" readonly="readonly" id="msg-input" :placeholder="msg_error" style="width:40%;height:30px;" /></p>
            
            <p>Then paste the output here</p>
            
            <p><textarea style="width:40%;height:12em" id="msg-sign-json"></textarea></p>
            
            
            <button type="button" class="btn vote-btn" @click="doManualVote">
                Vote
            </button>
        </div>
        

        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="success">Your vote has been registered :)</p>
    </div>


</template>

<script>
    var ethUtil = require('ethereumjs-util')
    var api_endpoint = 'http://speedy:8000'

    export default {
        name: 'FearfulRed',
        data() {
            return {
                myAddress: '',
                poll_id: '',
                question: '',
                answers: [],
                error: '',
                success: false
            }
        },
        beforeCreate() {
            var self = this
            let poll_id = this.$route.params['poll_id']
            self.poll_id = poll_id

            fetch(api_endpoint + "/poll/get?id=" + poll_id)
                    .then((res) => {
                        return res.json()
                    })
                    .then((json) => {
                        self.question = json.text
                        self.answers = json.choices
                    })
                    .catch((e) => {
                        self.error = 'Server is down, please come back later - ' + e.message
                    })
        },
        created() {
            this.updateAccount()
            window.setInterval(this.updateAccount.bind(this), 1000)
            this.genMsg()
        },
        methods: {
            updateAccount() {
                web3.eth.getAccounts().then(((accounts) => {
                    if (this.myAddress !== accounts[0]){
                        this.error = ''
                        this.success = false
                        this.myAddress = accounts[0]
                        this.loadResponse()
                    }
                }).bind(this))
            },
            loadResponse() {
                let poll_id = this.$route.params['poll_id']
                fetch(api_endpoint + "/poll/response?address=" + this.myAddress + '&poll_id=' + poll_id)
                        .then((res) => {return res.json()})
                        .then(((json) => {
                            console.log(json)
                            document.querySelectorAll('#poll-answers label')
                                    .forEach((e) => {e.className = ''})
                            if (json){
                                let lab = document.querySelectorAll('#poll-answers label[data-index="'+json.response+'"]').item(0)
                                lab.className = 'voted'
                                lab.click()
                                this.success = true
                            }
                        }).bind(this))
            },
            genMsg() {
                
                let poll_id = this.$route.params['poll_id']
                if (!poll_id) {
                    this.msg_error = 'Invalid poll id'
                    return
                }
                let address = this.myAddress
                var vote_id = ''
                document.querySelectorAll('#poll-answers-msg .answer-radio').forEach((r) => {
                    if (r.checked) {
                        vote_id = r.value
                    }
                })
                if (!vote_id) {
                    this.msg_error = 'Please choose an option to vote for'
                    return
                }

                let msg = 'poll_id=' + poll_id + '&resp=' + vote_id
                
                document.getElementById('msg-input').value = msg
                document.getElementById('msg-sign-json').value = ''
            },
            sendVote(msg, sig, address){
                let data = 'msg=' + encodeURIComponent(msg) + '&sig=' + sig + '&address=' + address
                fetch(api_endpoint + "/poll",
                        {
                            method: "POST",
                            body: data
                        })
                        .then((res) => {
                            return res.json()
                        })
                        .then(((json) => {
                            if (json.success) {
                                this.success = true
                                this.loadResponse()
                            } else {
                                this.error = json.error
                            }
                        }).bind(this))
                        .catch(((e) => {
                            this.error = e.message
                        }).bind(this))
            },
            doManualVote(){
                let msg = document.getElementById('msg-input').value
                if (!msg){
                    this.error = 'Please choose your response'
                    return
                }
                var vote_id = ''
                document.querySelectorAll('#poll-answers-msg .answer-radio').forEach((r) => {
                    if (r.checked) {
                        vote_id = r.value
                    }
                })
                if (!vote_id) {
                    this.error = 'Please choose an option to vote for'
                    return
                }
                
                var sig_json = JSON.parse(document.getElementById('msg-sign-json').value)
                if (!sig_json || !sig_json['address']){
                    this.error = 'Failed to parse MEW data'
                    return
                }
                
                let address = sig_json['address']
                let sig = sig_json['sig']
                
                this.sendVote(msg, sig, address)
            },
            doVote() {
                this.error = ''
                this.success = false
                let poll_id = this.$route.params['poll_id']
                if (!poll_id) {
                    this.error = 'Invalid poll id'
                    return
                }
                let address = this.myAddress
                var vote_id = ''
                document.querySelectorAll('#poll-answers .answer-radio').forEach((r) => {
                    if (r.checked) {
                        vote_id = r.value
                    }
                })
                if (!vote_id) {
                    this.error = 'Please choose an option to vote for'
                    return
                }

                let msg = 'poll_id=' + poll_id + '&resp=' + vote_id

                let h_msg = ethUtil.bufferToHex(new Buffer(msg, 'utf8'))

                let method = 'personal_sign'
                let params = [h_msg, address]
                var self = this
                web3.currentProvider.sendAsync({method, params, address}, (err, resp) => {
                    if (err) {
                        self.error = err
                    } else if (!resp.result) {
                        self.error = 'Failed to generate signature'
                    } else {
                        self.sendVote(msg, resp.result, address)
                    }
                })
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }

    .error {
        color: red;
        font-size: 14px;
    }
    .success {
        color: #009926;
        font-size: 16px;
        font-weight: bold;
    }

    .btn {
        font-size: 14px;
        border: 1px solid grey;
        background-color: #fff;
        padding: 10px 20px;
    }
    .btn-vote {
        color: #009926;
        border-color: #009926;
    }
    
    #poll-answers label {
        padding: 10px 20px;
        border: 2px solid #ccc;
    }
    #poll-answers label.voted {
        border-color: #009926;
    }
    .instructions-list li {
        display: block;
    }
</style>
