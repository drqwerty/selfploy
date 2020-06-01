package es.tfg.selfploy;

import android.content.res.Resources;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin
public class StatusBarPlugin extends Plugin {

    @PluginMethod
    public void getHeight(PluginCall call) {

        getActivity().getWindow().getDecorView().findViewById(android.R.id.content).setOnApplyWindowInsetsListener((view, windowInsets) -> {
            int statusBarHeight = windowInsets.getSystemWindowInsetTop();

            JSObject ret = new JSObject();
            ret.put("value", pxToDp(statusBarHeight));
            call.success(ret);
            return windowInsets;
        });
    }

    public int dpToPx(int dp) {
        return (int) (dp * Resources.getSystem().getDisplayMetrics().density);
    }

    public int pxToDp(int px) {
        return (int) Math.round(px / Resources.getSystem().getDisplayMetrics().density);
    }
}