/*--------------------------------------------------------------------------

The MIT License (MIT)

Copyright (c) 2013 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

module base64 {

    var characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

    export function encode(input: string): string {

        var output : string = ""

        var chr1   : number = 0
        
        var chr2   : number = 0
        
        var chr3   : number = 0
        
        var enc1   : number = 0
        
        var enc2   : number = 0
        
        var enc3   : number = 0
        
        var enc4   : number = 0

        var i      : number = 0

        input = utf8_encode(input)

        while(i < input.length) {

            chr1 = input.charCodeAt(i++)
            
            chr2 = input.charCodeAt(i++)
            
            chr3 = input.charCodeAt(i++)

            enc1 = chr1 >> 2
            
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
            
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
            
            enc4 = chr3 & 63

            if(isNaN(chr2)) {

                enc3 = enc4 = 64
            
            } else if(isNaN(chr3)) {

                enc4 = 64
            }

            output = output + characters.charAt(enc1) + characters.charAt(enc2) + characters.charAt(enc3) + characters.charAt(enc4)

        }

        return output
    }

    export function decode(input: string): string {
        
        var output : string = ""
        
        var chr1   : number = 0
        
        var chr2   : number = 0
        
        var chr3   : number = 0
        
        var enc1   : number = 0
        
        var enc2   : number = 0
        
        var enc3   : number = 0
        
        var enc4   : number = 0
        
        var i      : number = 0

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while(i < input.length) {

            enc1 = characters.indexOf(input.charAt(i++))

            enc2 = characters.indexOf(input.charAt(i++))

            enc3 = characters.indexOf(input.charAt(i++))

            enc4 = characters.indexOf(input.charAt(i++))

            chr1 = (enc1 << 2) | (enc2 >> 4)

            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)

            chr3 = ((enc3 & 3) << 6) | enc4

            output = output + String.fromCharCode(chr1)

            if(enc3 != 64) {

                output = output + String.fromCharCode(chr2)
            }
            if(enc4 != 64) {

                output = output + String.fromCharCode(chr3)
            }

        }

        output = utf8_decode(output);
        
        return output;

    }

    function utf8_encode(input: string): string {

        input = input.replace(/\r\n/g,"\n")

        var output = ""

        for(var n = 0;n < input.length; n++) {

            var c = input.charCodeAt(n);

            if(c<128) {

                output += String.fromCharCode(c)
            }
            else if((c > 127) && (c < 2048)) {

                output += String.fromCharCode((c >> 6) | 192)

                output += String.fromCharCode((c & 63) | 128)
            }
            else {

                output += String.fromCharCode((c >> 12) | 224)

                output += String.fromCharCode(((c >> 6) & 63) | 128)

                output += String.fromCharCode((c & 63) | 128)
            }
        }

        return output;
    }

    function utf8_decode(input: string): string {

        var output: string = ""

        var i: number      = 0;

        var c  : number    = 0
        
        var c1 : number    = 0
        
        var c2 : number    = 0

        var c3 : number    = 0

        while(i < input.length) {

            c = input.charCodeAt(i)

            if(c < 128) {

                output += String.fromCharCode(c)
                
                i++
            }
            else if((c > 191) && (c < 224)) {

                c2 = input.charCodeAt(i + 1)
                
                output += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
                
                i += 2;
            }
            else {
                c2 = input.charCodeAt(i + 1)
                
                c3 = input.charCodeAt(i + 2)
                
                output += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
                
                i += 3;
            }

        }

        return output
    }
}