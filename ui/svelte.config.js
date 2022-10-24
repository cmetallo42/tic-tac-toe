import preprocess from "svelte-preprocess";

export const svelte = (devel) => {
  return {
    preprocess: [
      preprocess({
        sourceMap: devel,
        typescript: preprocess.typescript(),
        sass: preprocess.sass()
      })
    ],
    compilerOptions: {
      hydratable: true,
      dev: devel,
    },
  };
};

export default svelte(true);