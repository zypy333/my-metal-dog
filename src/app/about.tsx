import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { openBrowserAsync } from 'expo-web-browser';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const APP_NAME = '撸铁雷达';
const AUTHOR = 'zypy333';
const VERSION = Constants.expoConfig?.version ?? '1.0.0';

const REPOSITORY_URL = 'https://github.com/zypy333/my-metal-dog';
const DOWNLOAD_URL = 'https://metal-dog.pages.dev/download';

const LICENSE_NAME = 'CC BY-NC 4.0（署名—非商业性使用 4.0 国际）';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans';
const LICENSE_LEGAL_URL = 'https://creativecommons.org/licenses/by-nc/4.0/legalcode.zh-hans';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Paragraph({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.paragraph}>
      <MaterialCommunityIcons name={icon} size={16} color={Palette.textMuted} style={styles.icon} />
      <Text style={styles.paragraphText}>{text}</Text>
    </View>
  );
}

function LinkRow({ icon, label, href }: { icon: IconName; label: string; href: string }) {
  // Web 端渲染成真实 <a target="_blank"> 链接，避免预览环境拦截 window.open
  const linkProps =
    Platform.OS === 'web'
      ? ({
          href,
          hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' },
        } as object)
      : ({ onPress: () => openBrowserAsync(href) } as object);

  return (
    <Pressable
      {...linkProps}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <MaterialCommunityIcons name={icon} size={18} color={Palette.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowLink} numberOfLines={1}>
        {href}
      </Text>
      <MaterialCommunityIcons name="chevron-right" size={18} color={Palette.textMuted} />
    </Pressable>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>关于</Text>
          <Text style={styles.subtitle}>非官方 · 个人作品</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.brandCard}>
            <Image source={require('@/assets/images/icon.png')} style={styles.brandIcon} />
            <View style={styles.brandText}>
              <Text style={styles.brandName}>{APP_NAME}</Text>
              <Text style={styles.brandMeta}>
                作者 {AUTHOR} · v{VERSION}
              </Text>
            </View>
          </View>

          <Section title="声明">
            <Paragraph
              icon="alert-circle-outline"
              text="本项目由个人独立开发，与「金属狗」App 的开发者、运营方及相关公司无任何隶属、合作或授权关系。项目中出现的名称、商标、门店信息等权利均归其各自权利人所有。"
            />
            <Paragraph
              icon="cloud-outline"
              text="门店列表、实时人数、温湿度等数据均来自第三方面向客户端的公开接口，仅用于个人查看，不做存储、转发或商业利用；数据可能存在延迟、缺失或错误，接口也可能随时变更或关闭，本项目不保证其准确性与持续可用性。"
            />
            <Paragraph
              icon="shield-off-outline"
              text="本项目按「现状」提供，不附带任何明示或默示的担保。因使用或无法使用本项目造成的直接或间接损失，作者不承担责任。"
            />
            <Paragraph
              icon="hand-back-right-outline"
              text="请勿将本项目用于商业用途、批量抓取、高频自动化请求，或任何违反第三方服务条款、干扰其正常服务的行为。"
            />
          </Section>

          <Section title="作者与仓库">
            <View style={styles.row}>
              <MaterialCommunityIcons name="account-outline" size={18} color={Palette.primary} />
              <Text style={styles.rowLabel}>作者</Text>
              <Text style={styles.rowValue}>{AUTHOR}</Text>
            </View>
            <View style={styles.divider} />
            <LinkRow icon="source-repository" label="源码仓库" href={REPOSITORY_URL} />
            <View style={styles.divider} />
            <LinkRow icon="bug-outline" label="问题反馈" href={`${REPOSITORY_URL}/issues`} />
          </Section>

          <Section title="下载">
            <LinkRow icon="download" label="Android 版 APK" href={DOWNLOAD_URL} />
            <View style={styles.divider} />
            <Paragraph
              icon="information-outline"
              text={`版本 v${VERSION} · 约 14.4 MB · 仅支持 arm64-v8a（Android 7.0 及以上）。个人侧载版本，未上架应用商店，安装前需在系统设置中允许安装未知来源应用。`}
            />
          </Section>

          <Section title="隐私">
            <Paragraph
              icon="cellphone-lock"
              text="所选门店与训练签到记录只保存在本机（AsyncStorage），不会上传到任何服务器；卸载应用或清除数据会一并删除。"
            />
            <Paragraph
              icon="web"
              text="应用唯一的外发请求，是读取第三方公开的门店、人数与温湿度数据。"
            />
          </Section>

          <Section title="许可">
            <View style={styles.row}>
              <MaterialCommunityIcons name="license" size={18} color={Palette.primary} />
              <Text style={styles.rowLabel}>协议</Text>
              <Text style={styles.rowValue}>{LICENSE_NAME}</Text>
            </View>
            <View style={styles.divider} />
            <LinkRow icon="file-document-outline" label="许可摘要" href={LICENSE_URL} />
            <View style={styles.divider} />
            <LinkRow icon="gavel" label="完整法律文本" href={LICENSE_LEGAL_URL} />
            <View style={styles.divider} />
            <Paragraph
              icon="copyright"
              text="你可以自由共享和演绎本项目的代码，但必须保留署名且不得用于商业目的。许可仅覆盖本仓库中的原创代码，不涉及任何第三方商标、数据或服务。"
            />
          </Section>

          <Text style={styles.footer}>
            © 2026 {AUTHOR} · {APP_NAME}（非官方）
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  scrollContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.three,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  brandMeta: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textMuted,
    paddingLeft: Spacing.one,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  paragraph: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  icon: {
    marginTop: 1,
  },
  paragraphText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Palette.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowLabel: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'right',
  },
  rowLink: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: Palette.primary,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  footer: {
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
