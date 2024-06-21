import { useTheme } from 'next-themes'
// import styles from './theme-image.module.css'
import Image, { ImageProps } from 'next/image'
 
type Props = Omit<ImageProps, 'src' | 'priority' | 'loading'> & {
  srcLight: string
  srcDark: string
}
 
const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props
  const { theme } = useTheme();
 
  return (
    <>
      <Image
      {...rest}
      src={theme === 'light' ? srcLight : srcDark}
      // className={styles.themeImage}
    />
    </>
  )
}

export default ThemeImage;