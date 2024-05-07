import React from 'react';
import {Dimensions} from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import {
  WebViewMessageEvent,
  WebViewSource,
} from 'react-native-webview/lib/WebViewTypes';

interface IDrawingZoneProps {
  source: WebViewSource | undefined;
  onMessage?: ((event: WebViewMessageEvent) => void) | undefined;
}
export default React.forwardRef<AutoHeightWebView, IDrawingZoneProps>(
  (props, ref) => {
    return (
      <AutoHeightWebView
        // className="mt-5"
        style={{width: Dimensions.get('window').width}}
        customScript={`document.body.style.background = 'lightyellow';`}
        customStyle={`
        * {
          font-family: 'Times New Roman';
          // overflow: hidden;
        }
        p {
          font-size: 12px;
        }
      `}
        onSizeUpdated={size => console.log(size.height)}
        scalesPageToFit={true}
        viewportContent={'width=device-width, user-scalable=no'}
        originWhitelist={['*']}
        mixedContentMode={'compatibility'}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        incognito={true}
        // automaticallyAdjustContentInsets={false}
        ref={ref}
        {...props}
      />
    );
  },
);

// function (props: IDrawingZoneProps) {

//   return (
//     <AutoHeightWebView
//             className="mt-5"
//             style={{width: Dimensions.get('window').width}}
//             customScript={`document.body.style.background = 'lightyellow';`}
//             customStyle={`
//       * {
//         font-family: 'Times New Roman';
//         // overflow: hidden;
//       }
//       p {
//         font-size: 12px;
//       }
//     `}
//             onSizeUpdated={size => console.log(size.height)}
//             // files={[
//             //   {
//             //     href: 'cssfileaddress',
//             //     type: 'text/css',
//             //     rel: 'stylesheet',
//             //   },
//             // ]}
//             // source={{
//             //   html: `<p style="font-weight: 400;font-style: normal;font-size: 21px;line-height: 1.58;letter-spacing: -.003em;">Tags are great for describing the essence of your story in a single word or phrase, but stories are rarely about a single thing. <span style="background-color: transparent !important;background-image: linear-gradient(to bottom, rgba(146, 249, 190, 1), rgba(146, 249, 190, 1));">If I pen a story about moving across the country to start a new job in a car with my husband, two cats, a dog, and a tarantula, I wouldn’t only tag the piece with “moving”. I’d also use the tags “pets”, “marriage”, “career change”, and “travel tips”.</span></p>`,
//             // }}
//             scalesPageToFit={true}
//             viewportContent={'width=device-width, user-scalable=no'}
//             originWhitelist={['*']}
//             source={{html: 'htmlString'}}
//             mixedContentMode={'compatibility'}
//             javaScriptEnabled={true}
//             domStorageEnabled={true}
//             scrollEnabled={false}
//             incognito={true}
//             onMessage={handleWebViewMessage}
//             // automaticallyAdjustContentInsets={false}
//             ref={webViewRef}
//           />
//   );
// }
