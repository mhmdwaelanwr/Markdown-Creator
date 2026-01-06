import 'dart:async';
import 'package:flutter/material.dart';

/// Safe wrapper around showDialog that ensures the [context] is mounted and
/// that a Navigator exists before opening the dialog. It schedules the
/// dialog show to the next frame to avoid calling into the widget tree during
/// a build scope which can cause "dirty widget in the wrong build scope" errors.
Future<T?> showSafeDialog<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  bool useRootNavigator = false,
  bool barrierDismissible = true,
}) {
  if (!context.mounted) return Future.value(null);

  final navigator = Navigator.maybeOf(context);
  if (navigator == null) return Future.value(null);

  final completer = Completer<T?>();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!context.mounted) {
      completer.complete(null);
      return;
    }
    try {
      showDialog<T>(
        context: context,
        builder: builder,
        useRootNavigator: useRootNavigator,
        barrierDismissible: barrierDismissible,
      ).then((value) {
        if (!completer.isCompleted) completer.complete(value);
      }).catchError((e) {
        if (!completer.isCompleted) completer.complete(null);
      });
    } catch (e) {
      if (!completer.isCompleted) completer.complete(null);
    }
  });

  return completer.future;
}

class StyledDialog extends StatelessWidget {
  final Widget title;
  final Widget content;
  final List<Widget>? actions;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry contentPadding;

  const StyledDialog({
    super.key,
    required this.title,
    required this.content,
    this.actions,
    this.width,
    this.height,
    this.contentPadding = const EdgeInsets.fromLTRB(24, 0, 24, 24),
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      contentPadding: contentPadding,
      actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
      title: title,
      content: SizedBox(
        width: width ?? 400,
        height: height,
        child: content,
      ),
      actions: actions,
    );
  }
}

class DialogHeader extends StatelessWidget {
  final String title;
  final IconData? icon;
  final Color? color;

  const DialogHeader({super.key, required this.title, this.icon, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (icon != null) ...[
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (color ?? Theme.of(context).primaryColor).withAlpha(30),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color ?? Theme.of(context).primaryColor, size: 24),
          ),
          const SizedBox(width: 16),
        ],
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
        ),
      ],
    );
  }
}
