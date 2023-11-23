import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Protyle,
    openWindow,
    IOperation,
    Constants
} from "siyuan";
import "@/index.scss";

import HelloExample from "@/hello.svelte";
import SettingPannel from "@/libs/setting-panel.svelte";

import { SettingUtils } from "./libs/setting-utils";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";
const OpenAI_Icon = `<svg t="1700723580045" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4448" width="200" height="200"><path d="M950.676002 419.057175a255.346807 255.346807 0 0 0-22.014863-209.48251 257.949339 257.949339 0 0 0-277.74565-123.72694A258.759964 258.759964 0 0 0 212.538139 178.386943a255.346807 255.346807 0 0 0-170.572521 123.726941 257.949339 257.949339 0 0 0 31.699696 302.789689 255.133485 255.133485 0 0 0 21.758876 209.525175 258.162662 258.162662 0 0 0 277.958972 123.726941A255.346807 255.346807 0 0 0 565.757223 1023.996587a258.375984 258.375984 0 0 0 246.259276-179.446729 255.560129 255.560129 0 0 0 170.529856-123.726941 258.375984 258.375984 0 0 0-31.870353-301.765742zM565.757223 957.013381a190.966133 190.966133 0 0 1-122.702994-44.371041l6.015689-3.455821 203.893466-117.668587a33.918248 33.918248 0 0 0 16.724469-29.054499v-287.430483l86.182214 49.832092a3.029177 3.029177 0 0 1 1.621249 2.218552v238.195693a192.160738 192.160738 0 0 1-191.734093 191.734094zM153.618516 780.979809a190.710147 190.710147 0 0 1-22.825487-128.590689l6.058354 3.626479 204.064123 117.711252a32.8943 32.8943 0 0 0 33.278281 0l249.288453-143.736574v99.493526a3.413157 3.413157 0 0 1-1.407927 2.645197L415.578315 851.205514a191.990081 191.990081 0 0 1-261.959799-70.225705zM99.861294 336.928085a191.350114 191.350114 0 0 1 100.944118-84.176984V494.957254a32.680978 32.680978 0 0 0 16.553811 28.841176l248.093849 143.139272-86.182214 49.832092a3.242499 3.242499 0 0 1-3.029177 0l-206.069353-118.863193A192.160738 192.160738 0 0 1 99.861294 335.904138z m708.102081 164.471503l-248.861809-144.504534L645.070458 307.23362a3.242499 3.242499 0 0 1 3.029177 0l206.069353 119.076514a191.734094 191.734094 0 0 1-28.841177 345.795467v-242.248817a33.704925 33.704925 0 0 0-17.364436-28.457196z m85.75557-128.97467l-6.01569-3.626479-203.680143-118.692534a33.107623 33.107623 0 0 0-33.491603 0L401.456378 393.842478V294.306288a2.815855 2.815855 0 0 1 1.194605-2.602533l206.069353-118.905856a191.990081 191.990081 0 0 1 284.998609 198.816394z m-539.278804 176.417552l-86.182214-49.661434a3.413157 3.413157 0 0 1-1.62125-2.431875V259.236099a191.990081 191.990081 0 0 1 314.65041-147.320388l-6.058354 3.413157-203.850801 117.668587a33.918248 33.918248 0 0 0-16.767134 29.054499z m46.802915-100.901454l111.012931-63.996693 111.226253 63.996693v127.950723l-110.799609 63.996693-111.226253-63.996693z" p-id="4449"></path></svg>`



export default class SiYuanAIPlugin extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;
    private blockIconEventBindThis = this.blockIconEvent.bind(this);
    private settingUtils: SettingUtils;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        console.log("loading plugin-sample", this.i18n);

        // 获取前端展示设备信息
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 顶部图标组件
        const topBarElement = this.addTopBar({
            icon: OpenAI_Icon,
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
            }
        });

        // 顶部图表的二级菜单展示，任意一个都可以生效
        this.addCommand({
            langKey: "showDialog",
            hotkey: "⇧⌘O",
            callback: () => {
                this.showDialog();
            },
            fileTreeCallback: (file: any) => {
                console.log(file, "fileTreeCallback");
            },
            editorCallback: (protyle: any) => {
                console.log(protyle, "editorCallback");
            },
            dockCallback: (element: HTMLElement) => {
                console.log(element, "dockCallback");
            },
        }); 
        this.addCommand({
            langKey: "getTab",
            hotkey: "⇧⌘M",
            globalCallback: () => {
                console.log(this.getOpenedTab());
            },
        });

        // 聊天窗口
        this.addDock({
            config: {
                position: "RightTop",
                size: { width: 500, height: 0 },
                icon: OpenAI_Icon,
                title: "Chat Box",
            },
            data: {
                text: "TODO: 创建类似于“讯飞IDEA插件”样式的聊天窗口"
            },
            type: DOCK_TYPE,
            resize() {
                console.log(DOCK_TYPE + " resize");
            },
            // 内部窗口样式
            init() {
                this.element.innerHTML = 
                `<div class="fn__flex-1 fn__flex-column">
                    <div class="block__icons">
                        <div class="block__logo">
                            ${OpenAI_Icon}
                            AI 控制台
                        </div>
                        <span class="fn__flex-1 fn__space"></span>
                        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}">
                            <svg><use xlink:href="#iconMin"></use></svg>
                        </span>
                    </div>
                    <div class="fn__flex-1 plugin-sample__custom-dock">
                        ${this.data.text}
                    </div>
                </div>`;
            },

            destroy() {
                console.log("destroy dock:", DOCK_TYPE);
            }
        });

        this.settingUtils = new SettingUtils(this, STORAGE_NAME);
        this.settingUtils.addItem({
            key: "Input",
            value: "",
            type: "textinput",
            title: "Readonly text",
            description: "Input description",
        });
        this.settingUtils.addItem({
            key: "InputArea",
            value: "",
            type: "textarea",
            title: "Readonly text",
            description: "Input description",
        });
        this.settingUtils.addItem({
            key: "Check",
            value: true,
            type: "checkbox",
            title: "Checkbox text",
            description: "Check description",
        });
        this.settingUtils.addItem({
            key: "Select",
            value: 1,
            type: "select",
            title: "Readonly text",
            description: "Select description",
            select: {
                options: [
                    {
                        val: 1,
                        text: "Option 1"
                    },
                    {
                        val: 2,
                        text: "Option 2"
                    }
                ]
            }
        });
        this.settingUtils.addItem({
            key: "Slider",
            value: 50,
            type: "slider",
            title: "Slider text",
            description: "Slider description",
            slider: {
                min: 0,
                max: 100,
                step: 1,
            }
        });
        this.settingUtils.addItem({
            key: "Btn",
            value: "",
            type: "button",
            title: "Button",
            description: "Button description",
            button: {
                label: "Button",
                callback: () => {
                    showMessage("Button clicked");
                }
            }
        });

        this.protyleSlash = [{
            filter: ["insert emoji 😊", "插入表情 😊", "crbqwx"],
            html: `<div class="b3-list-item__first"><span class="b3-list-item__text">${this.i18n.insertEmoji}</span><span class="b3-list-item__meta">😊</span></div>`,
            id: "insertEmoji",
            callback(protyle: Protyle) {
                protyle.insert("😊");
            }
        }];

        console.log(this.i18n.helloPlugin);
    }

    onLayoutReady() {
        // this.loadData(STORAGE_NAME);
        this.settingUtils.load();
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
        let tabDiv = document.createElement("div");
        new HelloExample({
            target: tabDiv,
            props: {
                app: this.app,
            }
        });
        this.customTab = this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.appendChild(tabDiv);
                console.log(this.element);
            },
            beforeDestroy() {
                console.log("before destroy tab:", TAB_TYPE);
            },
            destroy() {
                console.log("destroy tab:", TAB_TYPE);
            }
        });
    }

    async onunload() {
        console.log(this.i18n.byePlugin);
        await this.settingUtils.save();
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
    }

    /**
     * A custom setting pannel provided by svelte
     * 注意：需要配合下面的 addMenu() 方法
     */
    openGPTSetting(): void {
        let dialog = new Dialog({
            title: "SettingPannel",
            content: `<div id="SettingPanel"></div>`,
            width: "600px",
            destroyCallback: (options) => {
                console.log("destroyCallback", options);
                //You'd better destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        let pannel = new SettingPannel({
            target: dialog.element.querySelector("#SettingPanel"),
        });
    }


    private blockIconEvent({ detail }: any) {
        detail.menu.addItem({   
            iconHTML: "", 
            label: this.i18n.removeSpace,
            click: () => {
                const doOperations: IOperation[] = [];
                detail.blockElements.forEach((item: HTMLElement) => {
                    const editElement = item.querySelector('[contenteditable="true"]');
                    if (editElement) {
                        editElement.textContent = editElement.textContent.replace(/ /g, "");
                        doOperations.push({
                            id: item.dataset.nodeId,
                            data: item.outerHTML,
                            action: "update"
                        });
                    }
                });
                detail.protyle.getInstance().transaction(doOperations);
            }
        });
    }

    // 点击按钮后，跳出对话框（悬浮、固定）
    private showDialog() {
        let dialog = new Dialog({
            title: `SiYuan ${Constants.SIYUAN_VERSION}`,
            // 对话框样式
            content: `<div id="helloPanel" class="b3-dialog__content"></div>`,
            width: this.isMobile ? "92vw" : "720px",
            destroyCallback(options) {
                // hello.$destroy();
            },
        });
        new HelloExample({
            target: dialog.element.querySelector("#helloPanel"),
            props: {
                app: this.app,
            }
        });
    }

    // 配置菜单信息
    private addMenu(rect?: DOMRect) {
        // 菜单对象
        const menu = new Menu("topBarSample", () => {
            console.log("点击了顶栏图表");
        }); 

        // 说明文本
        menu.addItem({
            icon: "iconSparkles",
            label: "SiYuanAITools 设置",
            type: "readonly",
        });
        // 菜单分割线
        menu.addSeparator();

        // 打开聊天框
        // menu.addItem({
        //     icon: OpenAI_Icon,
        //     label: "打开聊天框",
        //     click: () => {
        //         openTab({
                    
        //         })
        //     }
        // })


        // 模型配置信息
        menu.addItem({
            icon: "iconSettings",
            label: "AI大模型配置",
            click: () => {
                this.openGPTSetting();
            }
        });

        
        // 根据不同的设备，展示不同的大小
        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }
}
