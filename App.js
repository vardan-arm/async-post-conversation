import { StatusBar } from 'expo-status-bar';
import React, {useCallback, useRef} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview'

export default function App() {
  const webviewRef = useRef(null)

  const sourceUri = (Platform.OS === 'android' ? 'file:///android_asset/' : '') + 'Web.bundle/loader.html'
  const params = 'platform=' + Platform.OS

  const sendDataToWebView = useCallback(() => {
    if (!webviewRef.current) {
      return
    }
    webviewRef.current.postMessage('message from mobile!')
    webviewRef.current.postMessage(JSON.stringify({ key: 'val 1', key2: 'val 2' }))
  }, [])

  const injectedJSBeforeIsLoaded = `
    alert('in injectedJSBeforeIsLoaded')
  `

  const injectedJS = `
    alert('in injected JS')
    if (!window.location.search) {
      var link = document.getElementById('web-bundle-progress-bar');
      link.href = './src/index.html?${params}';
      link.click();
    }
    true; // note: this is required, or you'll sometimes get silent failures
    `

  return (
    <View style={styles.container}>
      {/*<Text>Open up App.js to start working on your app!</Text>*/}
      {/*<StatusBar style="auto" />*/}
      <WebView
        source={{ uri: sourceUri }}
        ref={webviewRef}
        originWhitelist={['*']}
        onLoad={() => {
          sendDataToWebView()
        }}
        onLoadEnd={() => {console.log('load end');}}
        onError={(err) => console.error('An error has occurred', err)}
        onHttpError={() => console.error('An HTTP error occurred')}
        onMessage={(msg) => {
          console.log('msg.origin is', msg.isTrusted);
          console.log('In `onMessage`', msg.nativeEvent.data)
        }}
        allowFileAccess={true}
        injectedJavaScript={injectedJS}
        injectedJavaScriptBeforeContentLoaded={injectedJSBeforeIsLoaded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
