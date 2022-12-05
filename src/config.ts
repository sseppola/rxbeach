interface ConfigMap {
  reducerLogs: boolean;
  enableHotModuleReload: boolean;
}
type ConfigKeys = keyof ConfigMap;

function createGlobalConfig() {
  const config: ConfigMap = {
    reducerLogs: false,
    enableHotModuleReload: false,
  };

  return {
    setProperty: <Key extends ConfigKeys>(key: Key, value: ConfigMap[Key]) => {
      config[key] = value;
    },
    getProperty: <Key extends ConfigKeys>(key: Key) => {
      return config[key];
    },
  };
}

export const rxBeachConfig = createGlobalConfig();
