<template>
    <div id="app">

        <router-link to="/poll">Show active polls</router-link>

        <div id="logo"><a href="https://eosdac.io" target="_blank"><img src="/static/logo.png" /><div class="logo-text">(fearful red)</div></a></div>
        
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'app'
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    #logo {
        position: fixed;
        left: 10px;
        bottom: 10px;
    }
    #logo > a {
        text-decoration: none;
    }
    #logo > a > img {
        width: 80px;
        height: auto;
    }
    .logo-text {
        color: #aa4748;
        font-size: 16px;
    }
</style>
