<template>
  <div>
    <!-- <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>
    </div> -->
    <div class="router-container">
      <router-view />
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

body,
html {
  padding: 0;
  margin: 0;
  width: 100%;
  min-height: 100%;
}

.router-container {
  height: 100%;
}

body {
  background-image: url("~@/assets/Background_SansTexte.png");
  background-size: cover;
}
</style>
