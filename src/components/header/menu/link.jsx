import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { mountAnim, rotateX } from '../anim';
import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

export default function LinkComponent({ data, index }) {
    const { title, description, images } = data;
    const outer = useRef(null);
    const inner = useRef(null);

    const manageMouseEnter = (e) => {
        const bounds = e.target.getBoundingClientRect();
        if (e.clientY < bounds.top + (bounds.height / 2)) {
            gsap.set(outer.current, { top: "-100%" });
            gsap.set(inner.current, { top: "100%" });
        } else {
            gsap.set(outer.current, { top: "100%" });
            gsap.set(inner.current, { top: "-100%" });
        }
        gsap.to(outer.current, { top: "0%", duration: 0.3 });
        gsap.to(inner.current, { top: "0%", duration: 0.3 });
    };

    const manageMouseLeave = (e) => {
        const bounds = e.target.getBoundingClientRect();
        if (e.clientY < bounds.top + (bounds.height / 2)) {
            gsap.to(outer.current, { top: "-100%", duration: 0.3 });
            gsap.to(inner.current, { top: "100%", duration: 0.3 });
        } else {
            gsap.to(outer.current, { top: "100%", duration: 0.3 });
            gsap.to(inner.current, { top: "-100%", duration: 0.3 });
        }
    };

    return (
        <motion.div
            onMouseEnter={manageMouseEnter}
            onMouseLeave={manageMouseLeave}
            variants={rotateX}
            {...mountAnim}
            custom={index}
            className={styles.el}
        >
            <Link href={`/${data.link.toLowerCase()}`}>
                {title}
            </Link>
            <div ref={outer} className={styles.outer}>
                <div ref={inner} className={styles.inner}>
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className={styles.container}>
                            
                            <Link href={`/${data.link.toLowerCase()}`} className="menu-link">
                            <div className={styles.imageContainer}>
                            <Image
                                src={`/${data.images[0]}`}
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                                alt="image"
                            />
                            </div>
                            </Link>

                            <p>{description}</p>
                            
                            <Link href={`/${data.link.toLowerCase()}`} className="menu-link">
                               
                            </Link>
                            <div className={styles.imageContainer}>
                            
                            <Image
                                src={`/${data.images[0]}`}
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                                alt="image"
                            />

                            </div>
                            <p>{description}</p>
                        </div>

                        
                    ))}
                </div>

                
            </div>
        </motion.div>

        
    );
}
