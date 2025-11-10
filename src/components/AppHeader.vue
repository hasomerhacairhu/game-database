<template>
  <v-app-bar color="primary" elevation="2" prominent>
    <v-container class="header-content d-flex align-center">
      <v-img
        :src="logoUrl"
        alt="Somer Logo"
        max-width="50"
        class="mr-3"
      ></v-img>
      
      <v-toolbar-title class="text-h5 font-weight-bold">
        Somer Játékadatbázis
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        href="https://somer.hu"
        target="_blank"
        color="white"
        variant="outlined"
      >
        <v-icon start>mdi-open-in-new</v-icon>
        Ugrás a somer.hu-ra
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
const logoUrl = 'https://somer.fra1.digitaloceanspaces.com/somer.hu/uploads/2021/04/07135101/semelColor256.png'
</script>

<style scoped>
.v-toolbar-title {
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
