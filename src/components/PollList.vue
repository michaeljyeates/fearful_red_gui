<template>
  <div class="poll-list">
    <h1>Active polls</h1>
    
    <div v-for="poll of polls">
        <div>
            <router-link :to="{path: '/poll/' + poll._id}">{{ poll.text }}</router-link>
        </div>
    </div>
  </div>
    
    
</template>

<script>
var api_endpoint = 'http://speedy:8000'

export default {
  name: 'FearfulRedList',
  data () {
    return {
      polls: [],
      error: '',
      success: false
    }
  },
  beforeCreate () {
    web3.eth.getAccounts().then((accounts) => {
      this.myAddress = accounts[0]
    })
    
    fetch(api_endpoint + "/poll/active")
            .then((res) => {return res.json()})
            .then(((json) => {
                console.log(json)
                
              this.polls = json // .map((p) => {p.url = '/poll/' + p._id})
            }).bind(this))
            .catch((e) => {
                this.error = e.message
            })
  },
  methods: {
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    
</style>
