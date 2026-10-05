import { slideScreenModalStyles as styles } from "@/styles/components/layout/SlideUpScreenModal";
import { SlideUpScreenModalProps } from "@/types";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { useImperativeHandle, useMemo, useRef } from "react";

export const SlideUpScreenModal = React.forwardRef<BottomSheetMethods, SlideUpScreenModalProps>(({ children, onClose }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  useImperativeHandle(ref, () => bottomSheetRef.current as BottomSheetMethods, []);
  const snapPoints = useMemo(() => ["35%", "50%", "80%"], []);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={1}
      opacity={0.5}
      pressBehavior="close"
    />
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      containerStyle={{ zIndex: 100 }}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
});

SlideUpScreenModal.displayName = 'SlideUpScreenModal';
