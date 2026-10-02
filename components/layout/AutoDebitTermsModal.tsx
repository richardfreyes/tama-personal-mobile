import { AppText } from '@/components/common/AppText';
import ModalContent from '@/components/layout/ModalContent';
import { Colors } from '@/styles/common/colors';
import { AutoDebitTermsModalProps } from '@/types/common';
import { Linking, View } from 'react-native';

export const AutoDebitTermsModal = ({ visible, onClose }: AutoDebitTermsModalProps) => (
  <ModalContent
    visible={visible}
    title='Auto-Debit Enrollment Terms & Conditions'
    onClose={onClose}
  >
    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"1."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>{"By enrolling in this recurring payment program, the property owner authorizes Tama: (a) to initiate recurring debit card payments from the checking or savings account the property owner specify, or (b) to initiate recurring charges from the property owner's specified credit card."}</AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"2."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>{"The amount debited from the property owner's checking or savings account or charged to the property owner's credit card every month will be the amount that was specified during the auto-debit enrollment. The amount specified on the property owner's auto-debit enrollment should correspond the amount of the Monthly Amortization/Monthly Mortgage stated in the property owner's contract. Once the property owner's enrollment is processed, all payments will be automatically withdrawn from the property owner's specified checking or savings account or charged to the designated credit or debit card, on the date specified during the auto-debit enrollment, unless the property owner terminates the authorization in the manner described herein. Tama requires that the property owner set the auto debit date to 3 days prior to the due date stated in the property owner's contract."}</AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"3."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>
        {"The property owner has the right to terminate the authorization at any time online by emailing our customer support at "}
        <AppText size='small' style={{ color: Colors.aqua10 }} onPress={() => Linking.openURL('mailto:support@aqwire.co')}>{"support@aqwire.co"}</AppText>
        {" and terminating automatic payments or by calling our Tama office at "}
        <AppText size='small' style={{ color: Colors.aqua10 }} onPress={() => Linking.openURL('tel:+14083350522')}>{"+1 408-335-0522 (USA)"}</AppText>
        {" and terminating the authorization with a Tama customer support representative. Termination of the authorization should be done 3 business days prior to the property owner's next auto debit date."}
      </AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"4."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>
        {"The property owner must update any necessary changes to his/her checking/savings account or credit/debit card information by sending us an email at "}
        <AppText size='small' style={{ color: Colors.aqua10 }} onPress={() => Linking.openURL('mailto:support@aqwire.co')}>{"support@aqwire.co"}</AppText>
        {". If the property owner does not update his/her checking/savings account or credit/debit card information and Tama is unable to charge the property owner's credit card or withdraw funds from the property owner's debit card, checking account, or savings account for the amount due on the property owner's monthly amortization/monthly mortgage, the property owner may be subject to applicable late fees and any fees or charges assessed by the property owner's financial institution. Please contact your property developer directly for any concerns on late payments."}
      </AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"5."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>{"Tama shall bear no liability or responsibility for any losses of any kind that the property owner may incur as a result of a payment made on the incorrect property or for any delay in the actual date on which the property owner's account is debited or the property owner's credit card is charged."}</AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"6."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>{"Tama reserves the right to change these terms or terminate this program at any time. Notice will be given via Tama support email or by other methods."}</AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"7."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>{"These terms do not in any way terminate, amend or modify other terms, agreements or policies that apply to the property owner's contract or any services the property owner receives or other agreements the property owner may have with the property developer."}</AppText>
    </View>

    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <AppText size='small' weight='600' style={{ width: 24 }}>{"8."}</AppText>
      <AppText size='small' style={{ flex: 1 }}>{"Property owners are required to submit separate Auto Debit enrollments for each property."}</AppText>
    </View>
  </ModalContent>
);
