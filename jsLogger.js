

/* Examples:

jslogger.setLevelToVerbose(true);
jslogger.info('INFO', 'message');
jslogger.warning('WARNING', 'message');
jslogger.error('PROCCES', 'message');
jslogger.success('SUCCES', 'message');
jslogger.internal('INTERNAL', 'message');
jslogger.debug('DEBUG', 'message');

*/



try {
    var objLogs = "",
        useIE11 = !1,
        utc = function(e) {
            return e.toDateString() + " " + ("0" + e.getHours()).slice(-2) + ":" + ("0" + e.getMinutes()).slice(-2) + ":" + ("0" + e.getSeconds()).slice(-2)
        },
        jslogger = new function() {
            var e = !1,
                n = "BRAVO",
                t = function(e, t, o) {
                    if (useIE11) {
                        var r = utc(new Date) + " | " + n + " | [" + e + "] :: " + t;
                        objLogs += r + "\n", console.log(r)
                    } else {
                        r = utc(new Date) + " | " + n + " | [" + e + "] :: " + t;
                        objLogs += r + "\n", console.log("%c " + r, "color:" + {
                            info: "black",
                            debug: "blue",
                            success: "green",
                            warning: "orange",
                            error: "red"
                        } [o])
                    }
                };
            this.info = function(e, n) {
                t(e, n, "info")
            }, this.error = function(e, n) {
                t(e, n, "error")
            }, this.success = function(e, n) {
                t(e, n, "success")
            }, this.warning = function(e, n) {
                t(e, n, "warning")
            }, this.internal = function(e, t) {
                var o = utc(new Date) + " | " + n + " | [" + e + "] :: " + t;
                objLogs += o + "\n"
            }, this.debug = function(o, r) {
                if (e) t(o, r, "debug");
                else {
                    var i = utc(new Date) + " | " + n + " | [" + o + "] :: " + r;
                    objLogs += i + "\n"
                }
            }, this.downloadLogs = function() {
                var e = document.createElement("a"),
                    t = new Blob([objLogs], {
                        type: "text/plain"
                    });
                e.href = URL.createObjectURL(t), e.download = n + "-" + utc(new Date) + ".log", e.click()
            }, this.setLevelToVerbose = function(n) {
                e = n
            }, this.setAppName = function(e) {
                n = e
            }, this.version = function() {
                return "1.4.0"
            }, this.about = function() {
                return "Website: https://github.com/suhaibjanjua/js-logger \n Copyright: (c) 2019 Suhaib Janjua"
            }
        };
    ("Microsoft Internet Explorer" === navigator.appName || navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv 11/)) && (useIE11 = !0, jslogger.warning("Initialize ", "Internet Explorer 11 detected. You need to load ES6-shim in order to work (IE11-compat)"))
} catch (e) {
    console.log("Please ignore it...", e)
}

jslogger.setLevelToVerbose(true);