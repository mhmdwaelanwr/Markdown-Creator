import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/dialog_helper.dart';

class ConfirmDialog extends StatelessWidget {
  final String title;
  final String content;
  final String confirmText;
  final String cancelText;
  final VoidCallback onConfirm;
  final bool isDestructive;
  final IconData? icon;

  const ConfirmDialog({
    super.key,
    required this.title,
    required this.content,
    this.confirmText = 'Confirm',
    this.cancelText = 'Cancel',
    required this.onConfirm,
    this.isDestructive = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StyledDialog(
      title: DialogHeader(
        title: title,
        icon: icon ?? (isDestructive ? Icons.warning_amber_rounded : Icons.help_outline_rounded),
        color: isDestructive ? Colors.red : Colors.blue,
      ),
      width: 450,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDestructive 
                ? Colors.red.withAlpha(isDark ? 20 : 10)
                : Colors.blue.withAlpha(isDark ? 20 : 10),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDestructive ? Colors.red.withAlpha(30) : Colors.blue.withAlpha(30),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isDestructive ? Icons.error_outline_rounded : Icons.info_outline_rounded,
                  color: isDestructive ? Colors.red : Colors.blue,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    content,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      height: 1.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(cancelText, style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: Colors.grey)),
        ),
        const SizedBox(width: 8),
        FilledButton(
          onPressed: () {
            Navigator.pop(context);
            onConfirm();
          },
          style: FilledButton.styleFrom(
            backgroundColor: isDestructive ? Colors.red : Colors.blue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 0,
          ),
          child: Text(confirmText, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}
