<template>
  <div class="maintenance-container">
    <div class="text-container">
      <p id="french" style="font-weight: bold;">Ce site est actuellement en construction !</p>
      <p id="english" style="font-style: italic;">This site is currently under construction !</p>
    </div>
    <img src="../assets/Ordinateur_Transparent.gif" />
  </div>
</template>

<script>
export default {};
</script>

<style>
.maintenance-container {
  padding-top: 15%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

#french,
#english {
  color: blue;
  font-size: 40px;
}

.text-container {
  padding-top: 200px;
}
</style>