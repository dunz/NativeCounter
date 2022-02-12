# 네이티브 UI 컴포넌트 사용하기

## 안드로이드 카운터 만들기

안드로이드에서 UI와 관련한 코드는 XML형태로 작성하여 이를 클래스와 연동하여 기능을 구현한다

### 레이아웃 만들기

안드로이드 스튜디오에서 android디렉토리 활성화 후 

app에 New > XML > layout XML File 로 새 레이아웃 생성 (filename: counter_view)

### 레이아웃에 TextView와 Button 추가하기

만들어진 LinearLayout 에 TextView와 LinearLayout 하나 더 추가후 그 안에 Button 두개 추가

### View 클래스 만들기

만든 레이아웃을 리액트 네이티브에서 사용하려면 View 클래스를 만들어야 한다

리액트 네이티브의 View와 는 다른 개념

`android/app/src/main/java/com/nativecounter/CounterView.kt`
```kotlin
package com.nativecounter

import android.view.View
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext

class CounterView(val context: ReactContext): FrameLayout(context) {
    init {
        View.inflate(context, R.layout.counter_view, this)
    }
}
```

- FrameLayout은 LinearLayout처럼 안드로이드 네이티브 컴포넌트 중 하나로 내부에 단 하나의 자식컴포넌트를 보여줄수 있다
- 현재는 LinearLayout이 CounterView의 자식 컴포넌트가 된다
- init 은 자바의 constructor의 역할로 클래스 인스턴스가 새로 생성될때 실행된다
- init에서는 counter_view의 레이아웃을 불러와 FrameLayout내부에 그려주고 있다
- 레이아웃을 그리는 작업을 inflate라고 하고 레이아웃을 만들면 Int의 형태의 고유 ID가 주어진다
- ID값은 R.layout.counter_view를 사용하여 조회할수 있고 View.inflate 메서드를 사용할때 이 ID값을 사용한다

### Manager 클래스 만들기

- 네이티브 UI를 리액트 컴포넌트화 할 때는 컴포넌트를 위한 ViewManager 클래스를 만들어야 한다
- 이 클래스는 안드로이드 네이티브 컴포넌트를 리액트 네이티브 컴포넌트 형태로 사용할 수 있게 해준다
- SimpleViewManager를 사용받아서 만들수 있

`android/app/src/main/java/com/nativecounter/CounterManager.kt`
```kotlin
package com.nativecounter

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class CounterManager: SimpleViewManager<CounterView>() {
    // 리액트 네이티브 컴포넌트의 이름을 결정하는 메서드
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): CounterView {
        // CounterView 인스턴스를 만들어서 반환
        return CounterView(reactContext)
    }

    companion object {
        // 컴포넌트 이름을 클래스의 상수로 관리
        const val REACT_CLASS = "Counter"
    }
}
```

- getName 메서드는 컴포넌트를 불러올때 사용할 이름
- 이름값은 보통 REACT_CLASS 상숫값으로 선언하여 사용
- createViewInstance는 View를 반환하는 메서드

### 패키지 작성 및 등록하기

- 네이티브 모듈을 사용할때는 createNativeModules를 구현
- 네이티브 UI를 사용할때는 createNativeManagers를 구현

`android/app/src/main/java/com/nativecounter/CounterPackage.kt`
```kotlin
package com.nativecounter

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.*

class CounterPackage: ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return Collections.emptyList()
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> {
        val viewManagers = ArrayList<ViewManager<*, *>>()
        viewManagers.add(CounterManager())
        return viewManagers
    }
}
```

### 네이티브 컴포넌트 불러와서 사용하기

`Counter.js`
```js
import { requireNativeComponent } from "react-native";

const Counter = requireNativeComponent('Counter')

export default Counter;
```

- 네이티브 컴포넌트를 불러올때는 requireNativeComponent를 사용한다

### View 결합 기능 사용하기

```kotlin
view.findViewById<TextView>(R.id.textView).text = "10"
```
- View의 id로 View를 선택하고 속성을 변경하는 방식은 안드로이드 프로젝트에서 오랫동안 사용해오고 있는 방식
- 이 방식은 View의 타입을 직접 정해줘야 하므로 불편

#### View 결합 활성화하기

```gradle
android {
    buildFeatures {
        viewBinding = true
    }
}
```

`android/app/src/main/java/com/nativecounter/CounterView.kt`
```kotlin
package com.nativecounter
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext
import com.nativecounter.databinding.CounterViewBinding

class CounterView(val context: ReactContext): FrameLayout(context) {
    private val binding: CounterViewBinding
    init {
        val inflater = LayoutInflater.from(context)
        binding = CounterViewBinding.inflate(inflater, this, true)
        binding.button.text = "+1"      // 여기에서 button은 view의 id
    }
}
```

### 컴포넌트 Props 연동하기

`android/app/src/main/java/com/nativecounter/CounterView.kt`
```kotlin
package com.nativecounter
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext
import com.nativecounter.databinding.CounterViewBinding

class CounterView(val context: ReactContext): FrameLayout(context) {
    private val binding: CounterViewBinding

    fun setLeftButtonText(text: String) {
        binding.buttonLeft.text = text
    }

    fun setRightButtonText(text: String) {
        binding.buttonRight.text = text
    }

    fun setValue(value: Int) {
        binding.textView.text = value.toString()
    }

    init {
        val inflater = LayoutInflater.from(context)
        binding = CounterViewBinding.inflate(inflater, this, true)
    }
}
```

- binding을 통해 각 view의 id로 text을 설정해주는 메서드를 만든다

`android/app/src/main/java/com/nativecounter/CounterManager.kt`
```kotlin
package com.nativecounter

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class CounterManager: SimpleViewManager<CounterView>() {
    // 리액트 네이티브 컴포넌트의 이름을 결정하는 메서드
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): CounterView {
        // CounterView 인스턴스를 만들어서 반환
        return CounterView(reactContext)
    }

    @ReactProp(name = "leftButtonText")
    fun setLeftButtonText(view: CounterView, text: String) {
        view.setLeftButtonText(text)
    }

    @ReactProp(name = "rightButtonText")
    fun setRightButtonText(view: CounterView, text: String) {
        view.setRightButtonText(text)
    }

    @ReactProp(name = "value")
    fun setValue(view: CounterView, value: Int) {
        view.setValue(value)
    }

    companion object {
        // 컴포넌트 이름을 클래스의 상수로 관리
        const val REACT_CLASS = "Counter"
    }
}
```

- 리액트 네이티브에서 넘겨주는 Props를 연동하기 위해서는 setter메서드를 만들고 @ReactProp 데코레이터를 달고 내부에 name으로 prop 이름을 지정해준다ㅣ
- 내부에서는 view에서 제공하는 메서드를 호출해준다
- 이 메서드들은 컴포넌트가 처음 화면에 나타나거나 Props값이 바뀔때마다 호출된다

### 이벤트 설정하기

#### 이벤트 발생시키기

`android/app/src/main/java/com/nativecounter/CounterView.kt`
```kotlin
package com.nativecounter
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.nativecounter.databinding.CounterViewBinding


class CounterView(val context: ReactContext): FrameLayout(context) {
    private val binding: CounterViewBinding

    fun setupEvents() {
        val eventEmitter = context.getJSModule(RCTEventEmitter::class.java)
        binding.buttonLeft.setOnClickListener {
            eventEmitter.receiveEvent(id, "pressLeftButton", null)
        }
        binding.buttonRight.setOnClickListener {
            eventEmitter.receiveEvent(id, "pressRightButton", null)
        }
    }

    init {
        val inflater = LayoutInflater.from(context)
        binding = CounterViewBinding.inflate(inflater, this, true)
        this.setupEvents()
    }
}
```

- 클릭시 실행하고 싶다면 setOnClickListener 메서드를 사용한다
- 콜백을 파라미터로 넣을때는 소괄호를 생략할 수 있다

`android/app/src/main/java/com/nativecounter/CounterManager.kt`
```kotlin
import com.facebook.react.common.MapBuilder

override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any> {
    val builder = MapBuilder.builder<String, Any>()

    return builder
            .put("pressLeftButton", MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onPressLeftButton")
            ))
            .put("pressRightButton", MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onPressRightButton")
            )).build()
}
```

- CounterView에서 발생한 이벤트를 각 이벤트 처리 Props 콜백에 연결하는 작업

#### useState로 상태 관리하고 이벤트 관련 Props 설정하기

```js
const App: () => Node = () => {
  const [value, setValue] = useState(0);

  const onPressLeftButton = () => setValue(value + 1);
  const onPressRightButton = () => setValue(value - 1);
  return (
    <Counter
      style={styles.block}
      leftButtonText="+1"
      rightButtonText="-1"
      value={value}
      onPressLeftButton={onPressLeftButton}
      onPressRightButton={onPressRightButton}
    />
  );
};
export default App;
```
