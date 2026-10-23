# Less (CSS) wrapper for SocketStream 0.3

Allows you to use [Less](http://lesscss.org/) files (.less) in your SocketStream project.


### Instructions

Add `ss-less` to your application's `package.json` file and then add this line to app.js:

```javascript
ss.client.formatters.add(require('ss-less'));
```

### Compile errors

The formatter calls `callback(css)` on success and `callback(null, error)` on a
read or compile failure. Consumers must check the optional second argument.
Use the matching SocketStream pack error handling so a failed production pack
exits with status 1 and a development CSS request returns status 500.
