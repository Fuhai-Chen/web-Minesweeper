(function () {
    // 初始化方法
    // 初始化扫雷对象，初始化数据
    var JMS = function (id,rowCount,colCount, minLandMineCount, maxLandMineCount) {
        if (!(this instanceof JMS))
            return new JMS(id, rowCount, colCount, minLandMineCount, maxLandMineCount);
        this.doc = document;
        this.table = this.doc.getElementById(id);    //画格子的表格、总体架构
        this.cells = this.table.getElementsByTagName("td");     //小格子
        this.rowCount = rowCount || 10;     //定义表格行数与列数
        this.colCount = colCount || 10;
        this.landMineCount = 0;     //地雷个数初始化为0
        this.markLandMineCount = 0;     //已标记地雷个数初始化
        this.minLandMineCount = minLandMineCount || 10; //地雷最少个数
        this.maxLandMineCount = maxLandMineCount || 20; //地雷最多个数
        this.arrs = [];     //格子对应的数组
        this.beginTime = null;  //游戏开始时间
        this.endTime = null;    //游戏结束时间
        this.currentSetpCount = 0;  //当前走的步数
        this.endCallBack = null;    //！！！游戏结束时的回调函数
        this.landMineCallBack = null;   //标记成地雷时，更新剩余地雷个数的回调函数

        //禁用右键菜单
        this.doc.oncontextmenu = function () {
            return false;
        };

        //初始化参数后，执行画地图函数
        this.drawMap();

    };

    //在 JMS 的原型中创建格子
    JMS.prototype = {

        //获取元素
        $: function (id) {
            return this.doc.getElementById(id);
        },

        //画格子函数定义
        drawMap: function () {
            var tds = [];

            // 兼容浏览器（可去？？？？）
            if (
                window.ActiveXObject && parseInt(navigator.userAgent.match(/msie ([\d.]+)/i)[1]) < 8
                //表达式？？？
            ){
                //创建引入新的 CSS 文件
                var css = '#JMS_main table td{background-color:#888;}',
                //获取head标签
                    // 根据标签名称获取元素
                    head = this.doc.getElementsByTagName("head")[0],
                    //创建style标签
                    style = this.doc.createElement("style");
                style.type = "text/css";
                if (style.styleSheet){
                    // 将 CSS 样式赋给 style 标签
                    style.styleSheet.cssText = css;
                }else {
                    //在 style 标签中创建节点
                    style.appendChild(this.doc.createTextNode(css));
                }
                //再将style标签创建为head标签的子标签
                head.appendChild(style);
            }

            //利用嵌套for循环创建表格
            for (var i = 0; i < this.rowCount; i++) {
                tds.push("<tr>");
                for (var j = 0; j < this.colCount; j++) {
                    // !!!!字符串报错未修改（五月二十五日）
                    tds.push("<td id='m_" + i + "_" + j + "'></td>");
                }
                tds.push("</td>");
            }
            //调用setTableInnerHTML函数，详细定义见下
            this.setTableInnerHTML(this.table, tds.join(""));
        },





        //游戏初始化部分

        //初始化函数，把所有格子初始化为0
        // 一设置数组默认值为0，二是确定地雷个数
        init: function () {
            for (var i = 0; i < this.rowCount; i++) {
                this.arrs[i] = [];
                for (var j = 0; j < this.colCount; j++) {
                    this.arrs[i][j] = 0;
                }
            }
            this.landMineCount = this.selectFrom(this.minLandMineCount, this.maxLandMineCount);
            this.markLandMineCount = 0;
            this.beginTime = null;
            this.endTime = null;
            this.currentSetpCount = 0;
        },


        //landMine函数 把地雷单元的数组项的值设置为9（剩余1-8）
        landMine: function () {
            var allCount = this.rowCount * this.colCount - 1,
                tempArr = {};
            for (var i = 0; i < this.landMineCount; i++) {
                //此时调用随机数（取随机数函数定义见下selectFrom），把地雷随机放到数组中
                var randomNum = this.selectFrom(0, allCount),
                    //getRowCol函数定义见下，通过数值找到行数和列数
                    rowCol = this.getRowCol(randomNum);
                if (randomNum in tempArr) {
                    i--;
                    continue;
                }
                //赋值为9
                this.arrs[rowCol.row][rowCol.col] = 9;
                tempArr[randomNum] = randomNum;
            }
        },

        //计算其他格子中的数字
        //！！！该算法还未调试（5月28日）
        calculateNoLandMineCount: function () {
            //嵌套for循环遍历每一行与每一列
            for (var i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.colCount; j++) {
                    //地雷，不操作(继续保持数值为9)
                    if (this.arrs[i][j] == 9)
                        continue;
                    //根据坐标（数组下标）分别判断该各自周围是否有地雷，有地雷数值加一
                    if (i > 0 && j > 0) {
                        if (this.arrs[i - 1][j - 1] == 9)
                            this.arrs[i][j]++;
                    }
                    if (i > 0) {
                        if (this.arrs[i - 1][j] == 9)
                            this.arrs[i][j]++;
                    }
                    if (i > 0 && j < this.colCount - 1) {
                        if (this.arrs[i - 1][j + 1] == 9)
                            this.arrs[i][j]++;
                    }
                    if (j > 0) {
                        if (this.arrs[i][j - 1] == 9)
                            this.arrs[i][j]++;
                    }
                    if (j < this.colCount - 1) {
                        if (this.arrs[i][j + 1] == 9)
                            this.arrs[i][j]++;
                    }
                    if (i < this.rowCount - 1 && j > 0) {
                        if (this.arrs[i + 1][j - 1] == 9)
                            this.arrs[i][j]++;
                    }
                    if (i < this.rowCount - 1) {
                        if (this.arrs[i + 1][j] == 9)
                            this.arrs[i][j]++;
                    }
                    if (i < this.rowCount - 1 && j < this.colCount - 1) {
                        if (this.arrs[i + 1][j + 1] == 9)
                            this.arrs[i][j]++;
                    }
                }
            }
        },



        //给格子添加点击事件部分



        //!!!代码查错截至点
        // （6月1日）


        //给每个盒子绑定点击事件（左扫雷，右插旗）
        bindCells: function () {
            var self = this;
            for (var i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.colCount; j++) {
                    (function (row, col) {
                        self.$("m_" + i + "_" + j).onmousedown = function (e) {
                            e = e || window.event;
                            var mouseNum = e.button;
                            var className = this.className;
                            if (mouseNum == 2) {
                                if (className == "flag") {
                                    this.className = "";
                                    self.markLandMineCount--;
                                } else {
                                    this.className = "flag";
                                    self.markLandMineCount++;
                                }
                                if (self.landMineCallBack) {
                                    self.landMineCallBack(self.landMineCount - self.markLandMineCount);
                                }
                            } else if (className != "flag") {
                                self.openBlock.call(self, this, row, col);
                            }
                        };
                    })(i,j);
                }
            }
        },




        //展开无雷区域
        showNoLandMine: function (x, y) {
            for (var i = x - 1; i < x + 2; i++)
                for (var j = y - 1; j < y + 2; j++) {
                    if (!(i == x && j == y)) {
                        var ele = this.$("m_" + i + "_" + j);
                        if (ele && ele.className == "") {
                            this.openBlock.call(this, ele, i, j);
                        }
                    }
                }


        },

        //显示
        openBlock: function (obj, x, y) {
            if (this.arrs[x][y] != 9) {
                this.currentSetpCount++;
                if (this.arrs[x][y] != 0) {
                    obj.innerHTML = this.arrs[x][y];
                }
                obj.className = "normal";
                if (this.currentSetpCount + this.landMineCount == this.rowCount * this.colCount) {
                    this.success();
                }
                obj.onmousedown = null;
                if (this.arrs[x][y] == 0) {
                    this.showNoLandMine.call(this, x, y);
                }
            } else {
                this.failed();
            }
        },


        //显示地雷
        showLandMine: function () {
            for (var i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.colCount; j++) {
                    if (this.arrs[i][j] == 9) {
                        this.$("m_" + i + "_" + j).className = "landMine";
                    }
                }
            }
        },


        //显示所有格子信息
        showAll: function () {
            for (var i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.colCount; j++) {
                    if (this.arrs[i][j] == 9) {
                        this.$("m_" + i + "_" + j).className = "landMine";
                    } else {
                        var ele=this.$("m_" + i + "_" + j);
                        if (this.arrs[i][j] != 0)
                            ele.innerHTML = this.arrs[i][j];
                        ele.className = "normal";
                    }
                }
            }
        },

        //清除显示的格子信息
        hideAll: function () {
            for (var i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.colCount; j++) {
                    var tdCell = this.$("m_" + i + "_" + j);
                    tdCell.className = "";
                    tdCell.innerHTML = "";
                }
            }
        },

        //删除格子绑定的事件
        disableAll: function () {
            for (var i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.colCount; j++) {
                    var tdCell = this.$("m_" + i + "_" + j);
                    tdCell.onmousedown = null;
                }
            }
        },


        //添加游戏控制功能
        //游戏开始
        begin: function () {
            this.currentSetpCount = 0;//开始的步数清零
            this.markLandMineCount = 0;
            this.beginTime = new Date();//游戏开始时间
            this.hideAll();
            this.bindCells();
        },


        //游戏结束
        end: function () {
            this.endTime = new Date();
            //游戏结束时间
            if (this.endCallBack) {//如果有回调函数则调用
                this.endCallBack();
            }
        },


        //游戏成功
        success: function () {
            this.end();
            this.showAll();
            this.disableAll();
            alert("Congratulation! ");
        },


        //游戏失败
        failed: function () {
            this.end();
            this.showAll();
            this.disableAll();
            alert("GAME OVER！");
        },

        //通过数值找到行数和列数
        getRowCol: function (val) {
            return {
                row: parseInt(val / this.colCount),
                col: val % this.colCount
            };
        },

        //获取一个随机数
        selectFrom: function (iFirstValue, iLastValue) {
            var iChoices = iLastValue - iFirstValue + 1;
            return Math.floor(Math.random() * iChoices + iFirstValue);
        },



        //setTableInnerHTML函数定义 添加HTML到table
        setTableInnerHTML: function (table, html) {
            if (navigator && navigator.userAgent.match(/msie/i)) {
                //在 table 的 owner document 内创建 div
                var temp = table.ownerDocument.createElement('div');
                //在temp中直接创建tbody内容（未调试）
                temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                if (table.tBodies.length == 0) {
                    var tbody = document.createElement("tbody");
                    table.appendChild(tbody);
                }
                table.replaceChild(temp.firstChild.firstChild, table.tBodies[0]);
            } else {
                table.innerHTML = html;
            }
        },





        //入口函数
        play: function () {
            this.init();
            this.landMine();
            this.calculateNoLandMineCount();
        }
    };

    window.JMS = JMS;
})();
