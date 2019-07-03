/**
 * What it Does:
 *   This file contains loaders for images, sounds, and fonts.
 *   and a loadList function that lets you load any of these in a list.
 * 
 *   loadList: takes a list of assets loaders (loadImage, loadSound, or loadFont)
 *   and returns a list of object containing { type, key, value }
 *   where value is the loaded asset only after all the assets have loaded
 *   
 *   loadImage: takes a key and a url and returns an object containing
 *   { type: 'image', key: '<key>', value: '<the loaded image>' }
 * 
 *   loadSound: takes a key and a url and returns an object containing
 *   { type: 'sound', key: '<key>', value: '<the loaded sound>' }
 * 
 *   loadFont: takes a key and a google fontName and returns an object containing
 *   { type: 'font', key: '<key>', value: '<the loaded font>' }
 *   
 * What to Change:
 *   
 *   
 * How to Use it:
 * 
 *   loadList: input an array of loaders and pass a function to handle the the loaded assets
 *   eg. loadList(<list of loaders>).then(<function handle loaded assets>)
 * 
 *     loadList([
 *       loadImage('image_key', 'image_url'),
 *       loadSound('sound_key', 'sound_url'),
 *       loadFont('font_key', 'font_name')
 *     ]).then((loadedAssets) => {
 *       // attach loaded assets
 *     })
 *   
 *   loadImage: 
 *       loadImage('image_key', 'image_url')
 *         .then((loadedImage) => {
 *            // attach loaded image
 *         }) 
 * 
 *   loadSound: 
 *       loadSound('sound_key', 'sound_url')
 *         .then((loadedSound) => {
 *            // attach loaded sound
 *         }) 
 * 
 *   loadFont: 
 *       loadFont('font_key', 'font_name')
 *         .then((loadedFont) => {
 *            // attach loaded font
 *         }) 
 *   
 */

// import audioBufferLoader from 'audio-loader';
import WebFont from 'webfontloader'
import { createBase64Image } from './utils.js';
import { blankImage, defaultImage } from './placeholders.js';

/*
const loadList = (list, progress) => {
    // calculate loading progress
    let i = 0;
    progress({ percent: 0, loaded: null });
    for (const prm of list) {
        prm.then((asset) => {
            i++;
            progress({
                percent: Math.floor(i * 100 / list.length),
                loaded: { type: asset.type, key: asset.key }
            })
        });
    }

    return Promise.all(list)
        .then((assets) => {
            return assets.reduce((collection, asset) => {
                // separate assets by type
                // add them to the collection

                const { type, key, value } = asset;

                const collectionIncludes = Object.keys(collection).includes(type);
                if (!collectionIncludes) { collection[type] = {} }

                collection[type][key] = value;
                return collection;
            }, {});
        })
}

*/

const loadImage = (key, url, opts) => {
    return new Promise((resolve, reject) => {
        let optional = opts && opts.optional

        // reject with error for missing key or url
        if (!key) { reject(new Error('key required')) }
        if (!url && !optional) { reject(new Error('url required')) }

        // get fallback image
        // blank for optional images
        // default image for invalid urls
        let fallback = optional ?
            createBase64Image(blankImage) :
            createBase64Image(defaultImage);

        let result = { type: 'image', key: key, value: fallback };

        let image = new Image;
        image.src = opts && opts.params ?
        `${url}?${opts.params}` :
        url;

        // loaded
        image.onload = () => {
            // pre-decode so decoding will not block main thread
            // especially for large background images
            image.decode()
            .then(() => {
                resolve({
                    ...result,
                    ... { value: image }
                });
            })
            .catch((err) => {
                console.error(err);

                resolve({
                    ...result,
                    ... { value: createBase64Image(defaultImage) }
                });
            })
        };

        // error
        image.onerror = () => {
            resolve({
                ...result,
                ... { value: createBase64Image(defaultImage) }
            });
        };
    });

}

/*
const loadSound = (key, url) => {
    let result = { type: 'sound', key: key, value: null };

    // check
    if (!key || !url) { return result; }

    return new Promise((resolve, reject) => {
        audioBufferLoader(url)
            .then((sound) => {
                resolve({...result, ... { value: sound } });
            })
            .catch((err) => {
                reject(err);
            })
    });
}
*/

const loadFont = (key, fontName, opts) => {
    return new Promise((resolve) => {
        if (!key) {
            throw new Error('key required')
        }

        if (!fontName) {
            throw new Error('fontName required')
        }

        let res = {
            type: 'font',
            key: key,
            value: opts && opts.fallback || 'Arial'
        }

        WebFont.load({
            google: {
                families: [fontName]
            },
            fontactive: familyName => {
                resolve({...res, ...{ value: familyName }});
            },
            fontinactive: () => {
                resolve(res);
            }
        });
    });
}

// export { loadList, loadImage, loadSound, loadFont };
export { loadImage, loadFont };