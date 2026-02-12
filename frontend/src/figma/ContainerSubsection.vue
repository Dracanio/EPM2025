<template>
  <div class="container-subsection">
    <div class="container-3">
      <div class="container-4">
        <div class="text-wrapper-3">Willkommen zurück, Julien</div>
      </div>

      <div class="container-5">
        <p class="p">
          Starte mit einer Vorlage oder öffne eines deiner letzten
          Poster-Projekte.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContainerSubsection",
};
</script>

<style>
.container-subsection {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.container-3 {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.container-4 {
  display: flex;
  justify-content: flex-start;
}

.text-wrapper-3 {
  font-family: "Poppins-SemiBold", Helvetica, Arial, sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #000000;
}

.container-5 {
  display: flex;
  justify-content: flex-start;
}

.p {
  font-family: "Poppins-Regular", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #333333;
  margin: 0;
}
</style>