import React, {useCallback, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview'

const WaitMs = async (milliseconds = 1000) => {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
  return promise
}

export default function App() {
  const webviewRef = useRef(null)

  const sourceUri = (Platform.OS === 'android' ? 'file:///android_asset/' : '') + 'Web.bundle/src/index.html'
  const params = 'platform=' + Platform.OS

  const injectedJS = `
    if (!window.location.search) {
      var link = document.getElementById('web-bundle-progress-bar');
      link.href = './src/index.html?${params}';
      link.click();
    }
    true; // note: this is required, or you'll sometimes get silent failures
    `
  const messageListenerInMobile = async (msg) => {
    try {
      const data = JSON.parse(msg.nativeEvent.data)

      await WaitMs(2000)

      const payloadFromMobile = {
        mobileKey : 'Data from mobile',
        messageId: data.messageId,
        timeoutId: data.timeoutId
      }
      console.log('sending back', payloadFromMobile)

      webviewRef.current.postMessage(JSON.stringify(payloadFromMobile))
    } catch (error) {
      console.error('An error occurred: ', error)
    }
  }

  return (<View style={styles.container}>
    <Text>Some text above webview</Text>
    <View style={{
      flex: 1, width: '100%', height: '100%'
    }}>
      <WebView
        source={{uri: sourceUri}}
        ref={webviewRef}
        originWhitelist={['*']}
        onLoad={() => {}}
        onLoadEnd={() => {
          console.log('load end');
        }}
        onError={(err) => console.error('An error has occurred', err)}
        onHttpError={() => console.error('An HTTP error occurred')}
        onMessage={messageListenerInMobile}
        allowFileAccess={true}
        injectedJavaScript={injectedJS}
      />
    </View>
  </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'lightyellow', alignItems: 'center', justifyContent: 'center', // overflow: 'hidden',
  },
});
