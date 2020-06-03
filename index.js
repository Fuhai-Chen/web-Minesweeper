var jms = null,
    timeHandle = null;
window.onload = function () {
    var radios = document.getElementsByName("level");

    for (var i = 0, j = radios.length; i < j; i++) {
        radios[i].onclick = function () {
            // jms不为空，已开始游戏
            if (jms != null)
                // 剩余地雷数大于0，雷没排完
                if (jms.landMineCount > 0)
                    if (!confirm("确定结束当前游戏？"))
                        return false;

            var value = this.value;
            init(value, value, value * value / 5 - value, value * value / 5);
            document.getElementById("JMS_main").style.width = value * 40 + 180 + 60 + "px";
        }
    }
    init(10, 10);
};


//init 函数定义
function init(rowCount, colCount, minLandMineCount, maxLandMineCount) {
    var doc = document,
        landMineCountElement = doc.getElementById("landMineCount"),
        timeShow = doc.getElementById("costTime"),
        beginButton = doc.getElementById("begin");
    if (jms != null) {
        clearInterval(timeHandle);
        timeShow.innerHTML = 0;
        landMineCountElement.innerHTML = 0;

    }
    // 调用JMS函数，返回值赋jms （见顶，初始化null）
    jms = JMS("landmine", rowCount, colCount, minLandMineCount, maxLandMineCount);

    //开始按钮事件绑定
    jms.endCallBack = function () {
        clearInterval(timeHandle);
    };
    jms.landMineCallBack = function (count) {
        landMineCountElement.innerHTML = count;
    };

    //为开始按钮绑定事件
    beginButton.onclick = function () {
        jms.play(); //初始化入口函数

        //显示地雷个数
        landMineCountElement.innerHTML = jms.landMineCount;

        //开始
        jms.begin();

        //更新花费的时间
        timeHandle = setInterval(function () {
            timeShow.innerHTML = parseInt((new Date() - jms.beginTime) / 1000);
        }, 1000);
    };

}


