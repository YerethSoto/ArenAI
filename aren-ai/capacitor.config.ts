import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ArenAI',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      visible: false,
      style: 'DARK',
      overlaysWebView: true,
    },
  },
};


icon:{

  sources: {

    android:
    [

      {

        type: 'adaptive',
        foregroud: 'aren-ai\resources\Capybara profile picture.png',
        background: 'aren-ai\resources\Capybara profile picture.png'

      },
      {
        type: 'legacy',
        src: 'aren-ai\resources\Capybara profile picture.png'
      }


    ]


  }
}

export default config;
