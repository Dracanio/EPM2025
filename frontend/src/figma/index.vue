<template>
  <div class="startseite">
    <HeaderSubsection />
    <div class="main">
      <ContainerSubsection />
      <ContainerWrapperSubsection />
    </div>
  </div>
</template>

<script>
import { ContainerSubsection } from "./ContainerSubsection";
import { ContainerWrapperSubsection } from "./ContainerWrapperSubsection";
import { HeaderSubsection } from "./HeaderSubsection";

export default {
  name: "Startseite",
  components: {
    ContainerSubsection,
    ContainerWrapperSubsection,
    HeaderSubsection,
  },
};
</script>

<style>
.startseite {
  align-items: flex-start;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  min-height: 812px;
  position: relative;
}

.startseite .main {
  align-self: stretch;
  height: 748px;
  overflow: hidden;
  position: relative;
  width: 100%;
}
</style>