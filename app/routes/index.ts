import satori from "satori";
// import { html } from "satori-html";
// import { renderToString } from "vue/server-renderer";
import fsPromise from "fs/promises";
// import { createSSRApp } from "vue";
import path from "path";
// import font from "../public/DingTalkJinBuTi.ttf";

const __dirname = path.dirname("");

function hslToRgb(h: number, s: number, l: number) {
  // 将色调值转换为 0 到 1 之间的小数
  h = h / 360;

  // 饱和度和亮度值为百分比，转换为 0 到 1 之间的小数
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    // 当饱和度为 0 时，颜色为灰色
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  // 将 RGB 值转换为整数，并将值限制在 0 到 255 之间
  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  // return { r, g, b };
  return `rgb(${r},${g},${b})`;
}

function stringToDegrees(inputString: string) {
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    let char = inputString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 将哈希值转换为32位整数
  }
  return Math.abs(hash % 360);
}

async function readImageAsBase64(filePath: string) {
  // 读取图片文件
  const base64String = await fsPromise.readFile(filePath, {
    encoding: 'base64'
  });

  // 拼接 Base64 数据 URL
  const mimeType = path.extname(filePath).replace(".", "");
  const dataUrl = `data:image/${mimeType};base64,${base64String}`;

  return dataUrl;
}

const defaultModel = () => ({
  width: [600],
  height: [250],
  background: "blue",
  hue: [160],
  personSize: [230],
  personUrl: "/boy.png",
  text: "编写一个好标题",
  personY: [13],
  textY: [13],
  fontSize: [26],
  fromText: "@ijust.cc",
  fromEnable: true,
  linearEnable: true,
  useGrid: false,
});

const linearGradientColor = (mainColorHub: number) => {
  const step = 50;
  // second + 50，如果到了 360，就减去 360
  const secondColor =
    mainColorHub + step > 360 ? mainColorHub + step - 360 : mainColorHub + step;

  //  background: `linear-gradient(45deg, ${hslToRgb(
  //       mainColor,
  //       48.1,
  //       48.6
  //     )} 0%, ${hslToRgb(secondColor, 48.1, 48.6)} 100%)`,

  return [
    hslToRgb(mainColorHub, 48.1, 48.6),
    hslToRgb(secondColor, 48.1, 48.6),
  ];
};

export default eventHandler(async (e) => {
  const { title = "未设定 title 参数", w = 600, h = 250, } = getQuery(e);

  const rect = {
    width: Number(w),
    height: Number(h)
  };

  const mainColor = stringToDegrees(String(title));

  const [oneColor, secondColor] = linearGradientColor(mainColor);

  const fontPath = path.resolve(__dirname, "./public/DingTalkJinBuTi.ttf")
  const boyPath = path.relative(path.dirname("."), "./public/boy.png")


  const [font, boy] = await Promise.all([
    fsPromise.readFile(fontPath),
    readImageAsBase64(boyPath)
  ])

  setResponseHeaders(e, {
    "Content-Type": "image/svg+xml",
  });

  return satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        },
        children: [
          {
            type: "div",
            props: {
              class: "flex justify-center items-center flex-col relative",
              tw: "flex justify-center items-center flex-col relative",
              style: {
                width: rect.width + "px",
                height: rect.height + "px",
                willChange: "background",
                background: `linear-gradient(45deg, ${oneColor} 0%, ${secondColor} 100%)`,
              },
              children: [
                {
                  type: "div",
                  props: {
                    class:
                      "absolute w-full flex justify-center items-center bg-white left-0 py-2",
                    tw: "absolute w-full flex justify-center items-center bg-white left-0 py-2",
                    style: {
                      color: `${oneColor}`,
                      fontSize: "26px",
                      top: "13%",
                      willChange: "color",
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    class: "relative flex",
                    tw: "relative flex",
                    style: {
                      transform: "translate(0, 13%)",
                    },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: boy,
                          alt: "boy",
                          class: "",
                          style: {
                            width: "230px",
                            height: "230px",
                          },
                          children: [],
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    class: "absolute right-3 bottom-3 text-white text-sm",
                    tw: "absolute right-3 bottom-3 text-white text-sm",
                    children: "@ijust.cc",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: rect.width,
      height: rect.height,
      fonts: [
        {
          name: "MyFont",
          data: font,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
});
