<template>
  <div class="container">
    <iframe src="http://localhost:8080" width="1700" height="1000"></iframe>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    msg: String
  }
})
export default class Game extends Vue {
  msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

iframe {
  display: block;
  border-style: none;
}
</style>
